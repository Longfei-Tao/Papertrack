// 用户服务：当前用户、用户查询与昵称映射

const storage = require('./storage')

function getCurrentUserId() {
  return storage.getMeta('currentUserId')
}

function getCurrentUser() {
  return getUserById(getCurrentUserId())
}

function getUserById(id) {
  if (!id) return null
  return storage.getCollection('users').find((u) => u.id === id) || null
}

function getUsersByIds(ids) {
  const users = storage.getCollection('users')
  return (ids || []).map((id) => users.find((u) => u.id === id)).filter(Boolean)
}

// 昵称 map，便于批量取名字
function getUserMap() {
  const map = {}
  storage.getCollection('users').forEach((u) => { map[u.id] = u })
  return map
}

module.exports = {
  getCurrentUserId,
  getCurrentUser,
  getUserById,
  getUsersByIds,
  getUserMap,
}
