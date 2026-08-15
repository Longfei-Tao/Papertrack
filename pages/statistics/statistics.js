// 统计页：数字卡片 + 状态分布条形图 + 成员论文分布条形图
const paperService = require('../../services/paperService')
const teamService = require('../../services/teamService')
const userService = require('../../services/userService')
const constants = require('../../utils/constants')

Page({
  data: {
    teamName: '',
    statCards: [],
    statusBars: [],
    memberBars: [],
  },

  onShow() { this.load() },

  load() {
    const team = teamService.getCurrentTeam()
    if (!team) {
      wx.reLaunch({ url: '/pages/welcome/welcome' })
      return
    }
    const role = teamService.getCurrentRole()
    const userId = userService.getCurrentUserId()
    const papers = paperService.queryPapers({ teamId: team.id, role, userId, scope: 'all' })
    const count = (cat) => papers.filter((p) => p.statusCategory === cat).length

    const statCards = [
      { value: papers.length, label: '论文总数' },
      { value: count('review'), label: '审稿中' },
      { value: count('revision'), label: '返修中' },
      { value: count('accepted'), label: '已接收' },
      { value: count('published'), label: '已发表' },
      { value: count('rejected'), label: '已拒稿' },
    ]

    // 状态分布（按固定分类顺序，仅展示有论文的分类）
    let maxCat = 0
    const statusBars = constants.STATUS_CATEGORY_ORDER
      .map((key) => {
        const c = count(key)
        if (c > maxCat) maxCat = c
        return { key, label: constants.STATUS_CATEGORIES[key].label, color: constants.STATUS_CATEGORIES[key].color, count: c }
      })
      .filter((b) => b.count > 0)
    statusBars.forEach((b) => { b.percent = maxCat > 0 ? Math.round((b.count / maxCat) * 100) : 0 })

    // 成员论文分布（按负责数量降序）
    const members = teamService.getTeamMembers(team.id)
    let maxMember = 0
    const memberBars = members
      .map((m) => {
        const c = papers.filter((p) => (p.ownerIds || []).indexOf(m.userId) >= 0).length
        if (c > maxMember) maxMember = c
        return { name: m.nickname, count: c }
      })
      .filter((b) => b.count > 0)
      .sort((a, b) => b.count - a.count)
    memberBars.forEach((b) => { b.percent = maxMember > 0 ? Math.round((b.count / maxMember) * 100) : 0 })

    this.setData({ teamName: team.name, statCards, statusBars, memberBars })
  },
})
