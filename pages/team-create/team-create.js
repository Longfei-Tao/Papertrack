// 创建课题组
const teamService = require('../../services/teamService')
const userService = require('../../services/userService')

Page({
  data: { name: '', organization: '', description: '', ownerName: '' },
  onLoad() {
    const user = userService.getCurrentUser()
    this.setData({ ownerName: user ? user.nickname : '' })
  },
  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },
  onSubmit() {
    const name = this.data.name.trim()
    if (!name) {
      wx.showToast({ title: '请填写课题组名称', icon: 'none' })
      return
    }
    teamService.createTeam({
      name,
      organization: this.data.organization.trim(),
      description: this.data.description.trim(),
    })
    wx.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 600)
  },
})
