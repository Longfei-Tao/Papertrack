// 添加论文
const teamService = require('../../services/teamService')
const paperService = require('../../services/paperService')

Page({
  data: { members: [] },
  onLoad() {
    const team = teamService.getCurrentTeam()
    const members = teamService.getTeamMembers(team.id).map((m) => ({ userId: m.userId, nickname: m.nickname }))
    this.setData({ members })
  },
  onSubmit(e) {
    paperService.createPaper(e.detail.data)
    wx.showToast({ title: '已添加', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 600)
  },
})
