// 加入课题组：输入邀请码 -> 确认团队信息 -> 加入
const teamService = require('../../services/teamService')
const userService = require('../../services/userService')
const constants = require('../../utils/constants')

Page({
  data: { code: '', team: null, ownerName: '', memberCount: 0, roleText: '' },
  onInput(e) {
    this.setData({ code: e.detail.value.toUpperCase(), team: null })
  },
  onSearch() {
    const code = this.data.code.trim()
    if (!code) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' })
      return
    }
    const team = teamService.findTeamByInviteCode(code)
    if (!team) {
      wx.showToast({ title: '邀请码不存在', icon: 'none' })
      this.setData({ team: null })
      return
    }
    const owner = userService.getUserById(team.ownerId)
    this.setData({
      team,
      ownerName: owner ? owner.nickname : '',
      memberCount: teamService.getMemberCount(team.id),
      roleText: constants.ROLES.member,
    })
  },
  onJoin() {
    const res = teamService.joinTeam(this.data.code.trim())
    if (!res.ok) {
      wx.showToast({ title: res.message, icon: 'none' })
      return
    }
    wx.showToast({ title: '加入成功', icon: 'success' })
    setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 600)
  },
})
