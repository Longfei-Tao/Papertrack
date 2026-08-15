// 团队页：团队信息 + 邀请码 + 成员管理 + 我的课题组（切换）
const teamService = require('../../services/teamService')
const userService = require('../../services/userService')
const constants = require('../../utils/constants')

Page({
  data: {
    team: null,
    ownerName: '',
    memberCount: 0,
    members: [],
    myTeams: [],
    isAdmin: false,
  },

  onShow() { this.load() },

  load() {
    const team = teamService.getCurrentTeam()
    if (!team) {
      wx.reLaunch({ url: '/pages/welcome/welcome' })
      return
    }
    const currentUserId = userService.getCurrentUserId()
    const role = teamService.getCurrentRole()
    const owner = userService.getUserById(team.ownerId)
    const members = teamService.getTeamMembers(team.id).map((m) => ({
      userId: m.userId,
      nickname: m.nickname,
      role: m.role,
      roleLabel: constants.ROLES[m.role],
      isMe: m.userId === currentUserId,
      isOwner: m.userId === team.ownerId,
    }))
    const myTeams = teamService.getMyTeams().map(({ team: t, role: r }) => ({
      teamId: t.id,
      teamName: t.name,
      roleLabel: constants.ROLES[r],
      current: t.id === team.id,
    }))
    this.setData({
      team,
      ownerName: owner ? owner.nickname : '',
      memberCount: members.length,
      members,
      myTeams,
      isAdmin: role === 'admin',
    })
  },

  onCopyInviteCode() {
    wx.setClipboardData({ data: this.data.team.inviteCode, success: () => wx.showToast({ title: '已复制', icon: 'none' }) })
  },

  onRefreshInviteCode() {
    wx.showModal({
      title: '刷新邀请码',
      content: '刷新后旧邀请码将失效，确定刷新吗？',
      success: (res) => {
        if (res.confirm) {
          teamService.refreshInviteCode(this.data.team.id)
          this.load()
          wx.showToast({ title: '已刷新', icon: 'none' })
        }
      },
    })
  },

  onChangeRole(e) {
    const id = e.currentTarget.dataset.id
    const itemList = ['设为管理员', '设为成员', '设为观察者']
    wx.showActionSheet({
      itemList,
      success: (res) => {
        const roles = ['admin', 'member', 'viewer']
        teamService.updateMemberRole(this.data.team.id, id, roles[res.tapIndex])
        this.load()
        wx.showToast({ title: '已更新', icon: 'none' })
      },
    })
  },

  onRemoveMember(e) {
    const { id, name } = e.currentTarget.dataset
    wx.showModal({
      title: '移除成员',
      content: `确定将「${name}」移出课题组吗？`,
      confirmText: '移除',
      confirmColor: '#B5584E',
      success: (res) => {
        if (res.confirm) {
          teamService.removeMember(this.data.team.id, id)
          this.load()
        }
      },
    })
  },

  onSwitchTeam(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.team.id) return
    teamService.setCurrentTeam(id)
    wx.showToast({ title: '已切换', icon: 'success' })
    setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 500)
  },
})
