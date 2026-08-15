// 日期处理工具（相对时间、完整日期、返修截止倒计时）

function pad(n) { return n < 10 ? '0' + n : '' + n }

// 时间戳(ms) -> "YYYY-MM-DD"
function toDateStr(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 时间戳(ms) -> "2026年7月20日"
function toDateCN(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// "YYYY-MM-DD" -> "2026年7月20日"（投稿日期等纯日期字段）
function formatDateOnly(dateStr) {
  if (!dateStr) return ''
  const parts = String(dateStr).split('-')
  if (parts.length !== 3) return dateStr
  return `${Number(parts[0])}年${Number(parts[1])}月${Number(parts[2])}日`
}

// 相对时间：今天 10:26 / 昨天 16:42 / 8月12日 / 2026年7月20日
function formatRelative(ts) {
  if (!ts) return ''
  const now = new Date()
  const d = new Date(ts)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = startOfToday - 24 * 3600 * 1000
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (ts >= startOfToday) {
    return `今天 ${hm}`
  }
  if (ts >= startOfYesterday) {
    return `昨天 ${hm}`
  }
  if (d.getFullYear() === now.getFullYear()) {
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// 完整时间 "2026-07-20 10:26"
function formatFull(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 距离截止日期剩余天数（dateStr 为 "YYYY-MM-DD"，返回整数；无则 null）
function daysUntil(dateStr) {
  if (!dateStr) return null
  const parts = String(dateStr).split('-')
  if (parts.length !== 3) return null
  const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime()
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((target - startOfToday) / (24 * 3600 * 1000))
}

module.exports = {
  toDateStr,
  toDateCN,
  formatDateOnly,
  formatRelative,
  formatFull,
  daysUntil,
}
