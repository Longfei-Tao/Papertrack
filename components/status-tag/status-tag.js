// 状态标签：色点 + 中文分类（可选展示英文原文）
const constants = require('../../utils/constants')

function hexToRgba(hex, alpha) {
  const h = String(hex).replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

Component({
  properties: {
    category: { type: String, value: '' },
    status: { type: String, value: '' },
    showStatus: { type: Boolean, value: false },
  },
  data: { label: '', color: '#6B7686', bg: 'rgba(107,118,134,0.12)' },
  observers: {
    category(c) {
      const color = constants.categoryColor(c)
      this.setData({
        label: constants.categoryLabel(c),
        color,
        bg: hexToRgba(color, 0.12),
      })
    },
  },
})
