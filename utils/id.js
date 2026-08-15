// 简单唯一 ID 生成（本地 Mock 阶段使用；未来接入云数据库后由服务端生成）

function genId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8)
  const time = Date.now().toString(36)
  return `${prefix}_${time}_${rand}`
}

module.exports = { genId }
