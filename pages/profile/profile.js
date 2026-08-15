// 我的页面：头像/昵称/当前团队/角色/论文数/设置/关于/版本
const teamService = require('../../services/teamService')
const userService = require('../../services/userService')
const paperService = require('../../services/paperService')
const constants = require('../../utils/constants')
const storage = require('../../services/storage')

Page({
  data: {
    user: null,
    teamName: '',
    roleLabel: '',
    myPaperCount: 0,
    version: '0.1.0',
  },

  onShow() { this.load() },

  load() {
    const user = userService.getCurrentUser()
    const team = teamService.getCurrentTeam()
    const role = teamService.getCurrentRole()
    const userId = userService.getCurrentUserId()
    let myPaperCount = 0
    if (team) {
      myPaperCount = paperService.queryPapers({ teamId: team.id, role, userId, scope: 'mine' }).length
    }
    this.setData({
      user,
      teamName: team ? team.name : '未加入课题组',
      roleLabel: constants.ROLES[role] || '',
      myPaperCount,
    })
  },

  onSwitchTeam() {
    wx.switchTab({ url: '/pages/team/team' })
  },

  onAbout() {
    wx.showModal({
      title: '关于 PaperTrack',
      content: 'PaperTrack 是课题组科研论文投稿协作管理平台，帮助老师和学生清晰、高效地管理投稿进度。',
      showCancel: false,
      confirmText: '知道了',
    })
  },

  onReset() {
    wx.showModal({
      title: '重置演示数据',
      content: '将清空本地数据并恢复初始演示数据，确定吗？',
      confirmColor: '#B5584E',
      success: (res) => {
        if (res.confirm) {
          storage.resetDB()
          wx.reLaunch({ url: '/pages/welcome/welcome' })
        }
      },
    })
  },
})
