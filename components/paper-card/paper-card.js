// 论文卡片：左侧状态色条 + 标题/期刊/分区/状态/作者/负责人/更新时间/返修截止
Component({
  options: { styleIsolation: 'apply-shared' },
  properties: {
    paper: { type: Object, value: {} },
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.paper.id })
    },
  },
})
