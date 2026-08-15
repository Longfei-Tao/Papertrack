// 数据访问底层：本地存储封装（测试号阶段的 Mock 数据层）
//
// 这是未来替换为云数据库的唯一入口：接入正式 AppID 后，
// 只需重写本文件内部实现（改为调用云函数/云数据库），
// 上层 paperService / teamService 等无需改动。

const seed = require('./seed')

const DB_KEY = 'papertrack_db_v1'

function ensureSeeded() {
  const existing = wx.getStorageSync(DB_KEY)
  if (!existing) {
    const db = seed.build()
    wx.setStorageSync(DB_KEY, db)
    return db
  }
  return existing
}

// 读取整个数据库对象
function getDB() {
  return ensureSeeded()
}

// 整体写回数据库对象
function setDB(db) {
  wx.setStorageSync(DB_KEY, db)
}

// 读取某个集合（数组）
function getCollection(name) {
  const db = getDB()
  return db[name] || []
}

// 写回某个集合（数组）
function saveCollection(name, arr) {
  const db = getDB()
  db[name] = arr
  setDB(db)
}

// 读取元信息（当前用户、当前团队）
function getMeta(key) {
  const db = getDB()
  return (db.meta && db.meta[key]) || null
}

// 写元信息
function setMeta(key, value) {
  const db = getDB()
  if (!db.meta) db.meta = {}
  db.meta[key] = value
  setDB(db)
}

// 重置数据（开发调试用）
function resetDB() {
  wx.removeStorageSync(DB_KEY)
  return getDB()
}

module.exports = {
  getDB,
  setDB,
  getCollection,
  saveCollection,
  getMeta,
  setMeta,
  resetDB,
}
