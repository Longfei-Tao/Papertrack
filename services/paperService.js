// 论文服务：论文的查询、创建、更新（含差异检测/状态历史/活动/自动更新时间）、软删除
//
// 关键保证：
// 1. 所有查询强制按 teamId 过滤，团队数据隔离在服务层完成，不依赖前端隐藏；
// 2. 更新时间只在数据真实变化并保存时才更新；
// 3. 状态变化追加历史记录，绝不覆盖旧记录。

const storage = require('./storage')
const userService = require('./userService')
const activityService = require('./activityService')
const permission = require('../utils/permission')
const constants = require('../utils/constants')
const date = require('../utils/date')
const { genId } = require('../utils/id')

function normalize(v) {
  return v === undefined || v === null ? '' : v
}

function sameArray(a, b) {
  return (a || []).join('') === (b || []).join('')
}

// 负责人昵称列表
function ownerNames(paper) {
  return userService.getUsersByIds(paper.ownerIds).map((u) => u.nickname)
}

// 装饰论文：补全展示字段
function decoratePaper(paper) {
  const casQuartile = paper.casQuartile
  const jcrQuartile = paper.jcrQuartile
  const casText = casQuartile && casQuartile !== '暂未填写' ? `中科院${casQuartile}` : ''
  const jcrText = jcrQuartile && jcrQuartile !== '暂未填写' ? `JCR ${jcrQuartile}` : ''
  const revisionDays = date.daysUntil(paper.revisionDeadline)
  return Object.assign({}, paper, {
    firstAuthorText: (paper.firstAuthors || []).join('、'),
    correspondingAuthorText: (paper.correspondingAuthors || []).join('、'),
    ownerText: ownerNames(paper).join('、'),
    statusLabel: constants.categoryLabel(paper.statusCategory),
    statusColor: constants.categoryColor(paper.statusCategory),
    updatedAtText: date.formatRelative(paper.updatedAt),
    casText,
    jcrText,
    hasQuartile: !!(casText || jcrText),
    revisionDays,
    hasDeadline: revisionDays !== null && revisionDays !== undefined,
    deadlineUrgent: revisionDays !== null && revisionDays !== undefined && revisionDays <= 7,
  })
}

// 查询论文列表
// opts: { teamId, userId, role, scope('mine'|'all'), query, statusCategory, ownerId }
function queryPapers(opts) {
  const teamId = opts.teamId
  const role = opts.role
  const userId = opts.userId
  const scope = opts.scope || (role === 'admin' ? 'all' : 'mine')

  let list = storage.getCollection('papers').filter((p) => p.teamId === teamId && !p.deletedAt)

  // 可见性过滤（'private' 仅负责人与管理员）
  list = list.filter((p) => permission.canViewPaper(role, userId, p))

  // 范围：学生默认只看自己负责的论文
  if (scope === 'mine') {
    list = list.filter((p) => (p.ownerIds || []).indexOf(userId) >= 0)
  }

  // 成员筛选
  if (opts.ownerId) {
    list = list.filter((p) => (p.ownerIds || []).indexOf(opts.ownerId) >= 0)
  }

  // 状态分类筛选
  if (opts.statusCategory) {
    list = list.filter((p) => p.statusCategory === opts.statusCategory)
  }

  // 搜索：标题 / 期刊 / 第一作者 / 通讯作者 / 负责人
  if (opts.query && opts.query.trim()) {
    const q = opts.query.trim().toLowerCase()
    list = list.filter((p) => {
      return (p.title || '').toLowerCase().indexOf(q) >= 0
        || (p.journal || '').toLowerCase().indexOf(q) >= 0
        || (p.firstAuthors || []).join(',').toLowerCase().indexOf(q) >= 0
        || (p.correspondingAuthors || []).join(',').toLowerCase().indexOf(q) >= 0
        || ownerNames(p).join(',').toLowerCase().indexOf(q) >= 0
    })
  }

  // 默认按更新时间倒序（最近更新优先）
  list = list.sort((a, b) => b.updatedAt - a.updatedAt)

  return list.map(decoratePaper)
}

function getRawPaper(paperId) {
  return storage.getCollection('papers').find((p) => p.id === paperId) || null
}

function getPaper(paperId) {
  const p = getRawPaper(paperId)
  return p ? decoratePaper(p) : null
}

// 创建论文
function createPaper(data) {
  const teamId = data.teamId || storage.getMeta('currentTeamId')
  const operatorId = storage.getMeta('currentUserId')
  const now = Date.now()
  const id = genId('paper')
  const paper = {
    id,
    teamId,
    title: data.title || '',
    journal: data.journal || '',
    articleType: data.articleType || '',
    casQuartile: data.casQuartile || '暂未填写',
    jcrQuartile: data.jcrQuartile || '暂未填写',
    firstAuthors: data.firstAuthors || [],
    correspondingAuthors: data.correspondingAuthors || [],
    ownerIds: data.ownerIds || [],
    submissionDate: data.submissionDate || '',
    manuscriptId: data.manuscriptId || '',
    doi: data.doi || '',
    currentStatus: data.currentStatus || '',
    statusCategory: data.statusCategory || 'preparing',
    revisionDeadline: data.revisionDeadline || '',
    note: data.note || '',
    visibility: data.visibility || 'team',
    createdBy: operatorId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  const papers = storage.getCollection('papers')
  papers.unshift(paper)
  storage.saveCollection('papers', papers)

  // 填写了投稿状态则生成初始历史
  if (paper.currentStatus) {
    const history = storage.getCollection('statusHistory')
    history.push({
      id: genId('h'),
      teamId,
      paperId: id,
      status: paper.currentStatus,
      statusCategory: paper.statusCategory,
      operatorId,
      createdAt: now,
    })
    storage.saveCollection('statusHistory', history)
  }

  activityService.addActivity({ teamId, paperId: id, userId: operatorId, actionType: 'paper_created' })
  return paper
}

// 更新论文（差异检测 + 状态历史 + 活动 + 自动更新时间）
function updatePaper(paperId, newData) {
  const papers = storage.getCollection('papers')
  const idx = papers.findIndex((p) => p.id === paperId)
  if (idx < 0) return { changed: false, paper: null }
  const old = papers[idx]

  // 逐字段比较，判断是否有真实变化
  const scalarFields = ['title', 'journal', 'articleType', 'casQuartile', 'jcrQuartile',
    'submissionDate', 'manuscriptId', 'doi', 'currentStatus', 'statusCategory',
    'revisionDeadline', 'note', 'visibility']
  let changed = scalarFields.some((f) => normalize(old[f]) !== normalize(newData[f]))
  if (!changed) {
    const arrayFields = ['firstAuthors', 'correspondingAuthors', 'ownerIds']
    changed = arrayFields.some((f) => !sameArray(old[f], newData[f]))
  }

  // 没有实际变化：不更新、不生成时间戳
  if (!changed) return { changed: false, paper: old }

  const now = Date.now()
  const statusChanged = old.currentStatus !== normalize(newData.currentStatus)
    || old.statusCategory !== normalize(newData.statusCategory)
  const ownerChanged = !sameArray(old.ownerIds, newData.ownerIds)

  const updated = Object.assign({}, old, {
    title: newData.title,
    journal: newData.journal,
    articleType: newData.articleType || '',
    casQuartile: newData.casQuartile || '暂未填写',
    jcrQuartile: newData.jcrQuartile || '暂未填写',
    firstAuthors: newData.firstAuthors || [],
    correspondingAuthors: newData.correspondingAuthors || [],
    ownerIds: newData.ownerIds || [],
    submissionDate: newData.submissionDate || '',
    manuscriptId: newData.manuscriptId || '',
    doi: newData.doi || '',
    currentStatus: newData.currentStatus || '',
    statusCategory: newData.statusCategory || 'preparing',
    revisionDeadline: newData.revisionDeadline || '',
    note: newData.note || '',
    visibility: newData.visibility || 'team',
    updatedAt: now,
  })
  papers[idx] = updated
  storage.saveCollection('papers', papers)

  const operatorId = storage.getMeta('currentUserId') || updated.createdBy

  if (statusChanged) {
    // 状态变化：追加历史记录
    const history = storage.getCollection('statusHistory')
    history.push({
      id: genId('h'),
      teamId: updated.teamId,
      paperId: updated.id,
      status: updated.currentStatus,
      statusCategory: updated.statusCategory,
      operatorId,
      createdAt: now,
    })
    storage.saveCollection('statusHistory', history)
    activityService.addActivity({
      teamId: updated.teamId, paperId: updated.id, userId: operatorId,
      actionType: 'status_changed', beforeValue: old.currentStatus, afterValue: updated.currentStatus,
    })
  } else if (ownerChanged) {
    activityService.addActivity({
      teamId: updated.teamId, paperId: updated.id, userId: operatorId,
      actionType: 'owner_changed', beforeValue: (old.ownerIds || []).join(','), afterValue: (updated.ownerIds || []).join(','),
    })
  } else {
    activityService.addActivity({
      teamId: updated.teamId, paperId: updated.id, userId: operatorId,
      actionType: 'paper_updated',
    })
  }

  return { changed: true, paper: updated }
}

// 软删除
function softDeletePaper(paperId) {
  const papers = storage.getCollection('papers')
  const idx = papers.findIndex((p) => p.id === paperId)
  if (idx < 0) return false
  const old = papers[idx]
  papers[idx] = Object.assign({}, old, { deletedAt: Date.now(), updatedAt: Date.now() })
  storage.saveCollection('papers', papers)

  const operatorId = storage.getMeta('currentUserId')
  activityService.addActivity({
    teamId: old.teamId, paperId: old.id, userId: operatorId,
    actionType: 'paper_deleted', beforeValue: old.title, afterValue: '',
  })
  return true
}

// 状态历史（升序），补全日期与操作人
function getStatusHistory(paperId) {
  return storage.getCollection('statusHistory')
    .filter((h) => h.paperId === paperId)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((h) => {
      const user = userService.getUserById(h.operatorId)
      return Object.assign({}, h, {
        dateText: date.formatFull(h.createdAt),
        dateOnlyText: date.toDateCN(h.createdAt),
        operatorName: user ? user.nickname : '',
      })
    })
}

module.exports = {
  queryPapers,
  getRawPaper,
  getPaper,
  createPaper,
  updatePaper,
  softDeletePaper,
  getStatusHistory,
  decoratePaper,
}
