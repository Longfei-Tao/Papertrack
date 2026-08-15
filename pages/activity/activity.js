// 最近动态 / 操作记录
const activityService = require('../../services/activityService')
const teamService = require('../../services/teamService')

Page({
  data: { items: [], teamName: '' },

  onShow() { this.load() },

  load() {
    const team = teamService.getCurrentTeam()
    if (!team) {
      wx.reLaunch({ url: '/pages/welcome/welcome' })
      return
    }
    const items = activityService.listActivities(team.id).map(activityService.decorateActivity)
    this.setData({ items, teamName: team.name })
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.paperId
    if (id) wx.navigateTo({ url: '/pages/paper-detail/paper-detail?id=' + id })
  },
})
