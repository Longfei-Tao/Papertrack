// 论文首页 / 工作台（角色感知）
// 管理员：全组论文 + 概览 + 最近动态 + 成员筛选
// 成员：默认自己的论文，可切换查看全组
// 观察者：只读查看全组
const paperService = require('../../services/paperService')
const teamService = require('../../services/teamService')
const activityService = require('../../services/activityService')
const userService = require('../../services/userService')
const constants = require('../../utils/constants')
const permission = require('../../utils/permission')

const STATUS_OPTIONS = constants.STATUS_CATEGORY_ORDER.map((k) => ({ key: k, label: constants.STATUS_CATEGORIES[k].label }))

Page({
  data: {
    teamName: '',
    roleLabel: '',
    memberCount: 0,
    isAdmin: false,
    isMember: false,
    isViewer: false,
    hasMultipleTeams: false,
    scope: 'mine',
    stats: { total: 0, review: 0, revision: 0, accepted: 0 },
    statusFilter: '',
    ownerId: '',
    query: '',
    statusOptions: STATUS_OPTIONS,
    memberOptions: [],
    papers: [],
    activities: [],
  },

  onShow() {
    this.load()
  },

  load() {
    const team = teamService.getCurrentTeam()
    if (!team) {
      wx.reLaunch({ url: '/pages/welcome/welcome' })
      return
    }
    const userId = userService.getCurrentUserId()
    const role = teamService.getCurrentRole()
    const members = teamService.getTeamMembers(team.id)
    const isAdmin = permission.isAdmin(role)
    const isMember = role === 'member'
    const isViewer = permission.isViewer(role)
    const scope = (isAdmin || isViewer) ? 'all' : (this.data.scope || 'mine')

    const base = paperService.queryPapers({ teamId: team.id, role, userId, scope })
    const stats = {
      total: base.length,
      review: base.filter((p) => p.statusCategory === 'review').length,
      revision: base.filter((p) => p.statusCategory === 'revision').length,
      accepted: base.filter((p) => p.statusCategory === 'accepted').length,
    }

    this.setData({
      teamName: team.name,
      roleLabel: constants.ROLES[role] || '',
      memberCount: members.length,
      isAdmin,
      isMember,
      isViewer,
      hasMultipleTeams: teamService.getMyTeams().length > 1,
      scope,
      stats,
      memberOptions: members.map((m) => ({ userId: m.userId, nickname: m.nickname })),
    })
    this.refreshList()
  },

  refreshList() {
    const team = teamService.getCurrentTeam()
    const userId = userService.getCurrentUserId()
    const role = teamService.getCurrentRole()
    const papers = paperService.queryPapers({
      teamId: team.id,
      role,
      userId,
      scope: this.data.scope,
      query: this.data.query,
      statusCategory: this.data.statusFilter,
      ownerId: this.data.ownerId,
    })
    const activities = this.data.isAdmin
      ? activityService.listActivities(team.id, 3).map(activityService.decorateActivity)
      : []
    this.setData({ papers, activities })
  },

  // 成员切换「我的论文 / 全部论文」
  onScopeChange(e) {
    this.setData({ scope: e.currentTarget.dataset.scope, statusFilter: '', ownerId: '' })
    this.load()
  },

  // 概览卡点击筛选
  onStatTap(e) {
    this.setData({ statusFilter: e.currentTarget.dataset.key })
    this.refreshList()
  },

  onStatusFilter(e) {
    this.setData({ statusFilter: e.currentTarget.dataset.key })
    this.refreshList()
  },

  onOwnerFilter(e) {
    this.setData({ ownerId: e.currentTarget.dataset.id })
    this.refreshList()
  },

  onSearchInput(e) {
    this.setData({ query: e.detail.value })
    this.refreshList()
  },

  onClearSearch() {
    this.setData({ query: '' })
    this.refreshList()
  },

  onSwitchTeam() {
    wx.switchTab({ url: '/pages/team/team' })
  },

  onAddPaper() {
    wx.navigateTo({ url: '/pages/paper-add/paper-add' })
  },

  onPaperTap(e) {
    wx.navigateTo({ url: '/pages/paper-detail/paper-detail?id=' + e.detail.id })
  },

  onViewAllActivity() {
    wx.navigateTo({ url: '/pages/activity/activity' })
  },
})
