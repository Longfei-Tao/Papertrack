// 论文详情：完整信息 + 投稿时间线 + 编辑/删除
const paperService = require('../../services/paperService')
const teamService = require('../../services/teamService')
const userService = require('../../services/userService')
const permission = require('../../utils/permission')
const date = require('../../utils/date')

Page({
  data: {
    id: '',
    paper: null,
    history: [],
    canEdit: false,
    submissionDateText: '',
    revisionDeadlineText: '',
    updatedAtText: '',
    deadlineHint: '',
  },

  onLoad(options) {
    this.id = options.id
  },

  onShow() {
    this.load()
  },

  load() {
    const paper = paperService.getPaper(this.id)
    if (!paper) {
      wx.showToast({ title: '论文不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    const role = teamService.getCurrentRole()
    const userId = userService.getCurrentUserId()
    const canEdit = permission.canEditPaper(role, userId, paper)
    const history = paperService.getStatusHistory(this.id)
    this.setData({
      paper,
      history,
      canEdit,
      submissionDateText: date.formatDateOnly(paper.submissionDate),
      revisionDeadlineText: date.formatDateOnly(paper.revisionDeadline),
      updatedAtText: date.formatFull(paper.updatedAt),
      deadlineHint: paper.deadlineText || '',
    })
  },

  onEdit() {
    wx.navigateTo({ url: '/pages/paper-edit/paper-edit?id=' + this.data.id })
  },

  onDelete() {
    wx.showModal({
      title: '删除论文',
      content: '确定删除这篇论文吗？删除后将无法恢复。',
      confirmText: '确认删除',
      cancelText: '取消',
      confirmColor: '#B5584E',
      success: (res) => {
        if (res.confirm) {
          paperService.softDeletePaper(this.data.id)
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 600)
        }
      },
    })
  },
})
