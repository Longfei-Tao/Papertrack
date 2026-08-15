// 欢迎页：首次进入（未加入团队）展示创建/加入入口
const teamService = require('../../services/teamService')

Page({
  data: {},
  onLoad() {
    // 已加入团队则直接进入论文页
    if (teamService.getMyTeams().length > 0) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },
  onCreateTeam() {
    wx.navigateTo({ url: '/pages/team-create/team-create' })
  },
  onJoinTeam() {
    wx.navigateTo({ url: '/pages/team-join/team-join' })
  },
})
