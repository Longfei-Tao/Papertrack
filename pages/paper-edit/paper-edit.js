// 编辑论文（含权限校验；差异检测在 paperService.updatePaper 完成）
const teamService = require('../../services/teamService')
const paperService = require('../../services/paperService')
const userService = require('../../services/userService')
const permission = require('../../utils/permission')

Page({
  data: { id: '', paper: null, members: [] },
  onLoad(options) {
    const id = options.id
    const paper = paperService.getRawPaper(id)
    if (!paper) {
      wx.showToast({ title: '论文不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    const team = teamService.getCurrentTeam()
    const role = teamService.getCurrentRole()
    const userId = userService.getCurrentUserId()
    if (!permission.canEditPaper(role, userId, paper)) {
      wx.showToast({ title: '您没有编辑权限', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    const members = teamService.getTeamMembers(team.id).map((m) => ({ userId: m.userId, nickname: m.nickname }))
    this.setData({ id, paper, members })
  },
  onSubmit(e) {
    const res = paperService.updatePaper(this.data.id, e.detail.data)
    if (!res.changed) {
      wx.showToast({ title: '内容未变化', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    wx.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 600)
  },
})
