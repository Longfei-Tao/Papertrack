// 活动/操作记录服务：供老师首页「最近动态」使用

const storage = require('./storage')
const userService = require('./userService')
const date = require('../utils/date')
const { genId } = require('../utils/id')

// 新增一条活动记录
function addActivity(data) {
  const list = storage.getCollection('activities')
  list.push({
    id: genId('act'),
    teamId: data.teamId,
    paperId: data.paperId,
    userId: data.userId,
    actionType: data.actionType,
    beforeValue: data.beforeValue || '',
    afterValue: data.afterValue || '',
    createdAt: data.createdAt || Date.now(),
  })
  storage.saveCollection('activities', list)
}

// 某团队的活动列表（按时间倒序）
function listActivities(teamId, limit) {
  const list = storage.getCollection('activities')
    .filter((a) => a.teamId === teamId)
    .sort((a, b) => b.createdAt - a.createdAt)
  return limit ? list.slice(0, limit) : list
}

// 装饰活动记录：补全用户昵称、论文标题、相对时间、动作描述
function decorateActivity(a) {
  const user = userService.getUserById(a.userId)
  const paper = storage.getCollection('papers').find((p) => p.id === a.paperId)
  return Object.assign({}, a, {
    userName: user ? user.nickname : '未知成员',
    paperTitle: paper ? paper.title : '',
    timeText: date.formatRelative(a.createdAt),
    actionText: actionText(a),
  })
}

// 动作中文描述
function actionText(a) {
  switch (a.actionType) {
    case 'paper_created': return '新增了论文'
    case 'status_changed': return `${a.beforeValue || '—'} → ${a.afterValue || '—'}`
    case 'owner_changed': return '调整了负责人'
    case 'paper_updated': return '更新了论文信息'
    case 'paper_deleted': return '删除了论文'
    default: return '更新了论文'
  }
}

module.exports = {
  addActivity,
  listActivities,
  decorateActivity,
}
