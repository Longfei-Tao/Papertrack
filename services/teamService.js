// 团队服务：课题组创建、加入、成员管理、团队切换、邀请码

const storage = require('./storage')
const userService = require('./userService')
const { genId } = require('../utils/id')

function getCurrentTeamId() {
  return storage.getMeta('currentTeamId')
}

function setCurrentTeam(teamId) {
  storage.setMeta('currentTeamId', teamId)
}

function getTeamById(teamId) {
  if (!teamId) return null
  return storage.getCollection('teams').find((t) => t.id === teamId) || null
}

function getCurrentTeam() {
  return getTeamById(getCurrentTeamId())
}

// 当前用户加入的所有团队（含角色）
function getMyTeams() {
  const userId = userService.getCurrentUserId()
  const teams = storage.getCollection('teams')
  const members = storage.getCollection('members')
  return members
    .filter((m) => m.userId === userId)
    .map((m) => {
      const team = teams.find((t) => t.id === m.teamId)
      return team ? { team, role: m.role } : null
    })
    .filter(Boolean)
}

// 团队成员（含用户信息），按角色与加入时间排序
function getTeamMembers(teamId) {
  const members = storage.getCollection('members').filter((m) => m.teamId === teamId)
  const roleOrder = { admin: 0, member: 1, viewer: 2 }
  return members
    .map((m) => {
      const user = userService.getUserById(m.userId)
      return Object.assign({}, m, {
        nickname: user ? user.nickname : '未知成员',
        avatarUrl: user ? user.avatarUrl : '',
      })
    })
    .sort((a, b) => (roleOrder[a.role] - roleOrder[b.role]) || (a.joinedAt - b.joinedAt))
}

// 当前用户在当前团队中的角色
function getCurrentRole() {
  const teamId = getCurrentTeamId()
  const userId = userService.getCurrentUserId()
  const m = storage.getCollection('members').find((x) => x.teamId === teamId && x.userId === userId)
  return m ? m.role : null
}

function getRoleInTeam(teamId, userId) {
  const m = storage.getCollection('members').find((x) => x.teamId === teamId && x.userId === userId)
  return m ? m.role : null
}

function getMemberCount(teamId) {
  return storage.getCollection('members').filter((m) => m.teamId === teamId).length
}

// 生成 6 位邀请码（去除易混淆字符）
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

// 按邀请码查找团队（忽略大小写、去除首尾空格）
function findTeamByInviteCode(code) {
  const c = String(code || '').trim().toUpperCase()
  return storage.getCollection('teams').find((t) => t.inviteCode === c) || null
}

// 创建课题组：创建者自动成为管理员，并设为当前团队
function createTeam(data) {
  const userId = userService.getCurrentUserId()
  const now = Date.now()
  const team = {
    id: genId('team'),
    name: data.name,
    ownerId: userId,
    organization: data.organization || '',
    description: data.description || '',
    inviteCode: generateInviteCode(),
    createdAt: now,
    updatedAt: now,
  }
  const teams = storage.getCollection('teams')
  teams.push(team)
  storage.saveCollection('teams', teams)

  const members = storage.getCollection('members')
  members.push({ id: genId('mem'), teamId: team.id, userId, role: 'admin', joinedAt: now })
  storage.saveCollection('members', members)

  setCurrentTeam(team.id)
  return team
}

// 通过邀请码加入课题组（重复加入则忽略）
function joinTeam(inviteCode) {
  const team = findTeamByInviteCode(inviteCode)
  if (!team) return { ok: false, message: '邀请码不存在' }

  const userId = userService.getCurrentUserId()
  const members = storage.getCollection('members')
  const existed = members.find((m) => m.teamId === team.id && m.userId === userId)
  if (!existed) {
    members.push({ id: genId('mem'), teamId: team.id, userId, role: 'member', joinedAt: Date.now() })
    storage.saveCollection('members', members)
  }
  setCurrentTeam(team.id)
  return { ok: true, team }
}

// 修改成员角色
function updateMemberRole(teamId, userId, role) {
  const members = storage.getCollection('members')
  const m = members.find((x) => x.teamId === teamId && x.userId === userId)
  if (!m) return false
  m.role = role
  storage.saveCollection('members', members)
  return true
}

// 移除成员
function removeMember(teamId, userId) {
  const members = storage.getCollection('members').filter((x) => !(x.teamId === teamId && x.userId === userId))
  storage.saveCollection('members', members)
}

// 刷新邀请码
function refreshInviteCode(teamId) {
  const teams = storage.getCollection('teams')
  const t = teams.find((x) => x.id === teamId)
  if (!t) return ''
  t.inviteCode = generateInviteCode()
  storage.saveCollection('teams', teams)
  return t.inviteCode
}

module.exports = {
  getCurrentTeamId,
  setCurrentTeam,
  getTeamById,
  getCurrentTeam,
  getMyTeams,
  getTeamMembers,
  getCurrentRole,
  getRoleInTeam,
  getMemberCount,
  generateInviteCode,
  findTeamByInviteCode,
  createTeam,
  joinTeam,
  updateMemberRole,
  removeMember,
  refreshInviteCode,
}
