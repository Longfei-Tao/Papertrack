// 成员头像：姓名首字 + 低饱和色块
const PALETTE = ['#3563A6', '#4F6D95', '#5B6AB8', '#3F8E5F', '#C08A3E', '#B5584E', '#4A7BB8', '#6B7686']

function colorFor(name) {
  const s = String(name || '?')
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) & 0xffff
  return PALETTE[hash % PALETTE.length]
}

Component({
  properties: {
    name: { type: String, value: '' },
    size: { type: Number, value: 64 },
  },
  data: { initial: '?', bg: PALETTE[0] },
  observers: {
    name(n) {
      const s = String(n || '?')
      this.setData({ initial: s.charAt(0), bg: colorFor(n) })
    },
  },
})
