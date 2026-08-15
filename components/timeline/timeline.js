// 投稿时间线：纵向节点 + 连接线，当前状态（最后一项）高亮
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
    items: { type: Array, value: [] },
  },
  data: { list: [] },
  observers: {
    items(items) {
      this.setData({
        list: (items || []).map((it) => {
          const color = constants.categoryColor(it.statusCategory)
          return Object.assign({}, it, {
            statusLabel: constants.categoryLabel(it.statusCategory),
            statusColor: color,
            bg: hexToRgba(color, 0.12),
          })
        }),
      })
    },
  },
})
