// 论文表单（新增/编辑复用）
// 通过 properties.initial 传入已有论文（编辑态），为空则新增。
// 通过 triggerEvent('submit', { data }) 输出表单数据。

const constants = require('../../utils/constants')

const CATEGORY_KEYS = constants.STATUS_CATEGORY_ORDER
const CATEGORY_OPTIONS = CATEGORY_KEYS.map((k) => ({ key: k, label: constants.STATUS_CATEGORIES[k].label }))

Component({
  options: { styleIsolation: 'apply-shared' },
  properties: {
    initial: { type: Object, value: null },
    members: { type: Array, value: [] },
    submitText: { type: String, value: '保存' },
  },
  data: {
    title: '',
    journal: '',
    articleTypes: constants.ARTICLE_TYPES,
    articleTypeIndex: 0,
    casOptions: constants.CAS_QUARTILES,
    casIndex: 4,
    jcrOptions: constants.JCR_QUARTILES,
    jcrIndex: 4,
    firstAuthors: [],
    firstAuthorInput: '',
    correspondingAuthors: [],
    correspondingAuthorInput: '',
    memberOptions: [],
    ownerIds: [],
    categoryOptions: CATEGORY_OPTIONS,
    categoryIndex: 0,
    currentStatus: '',
    suggestions: [],
    isRevision: false,
    submissionDate: '',
    revisionDeadline: '',
    manuscriptId: '',
    doi: '',
    note: '',
    visibilities: constants.VISIBILITIES,
    visibilityIndex: 0,
  },
  lifetimes: {
    attached() {
      this.initFromInitial(this.data.initial)
      this.syncMembers(this.data.members)
    },
  },
  observers: {
    initial(v) { this.initFromInitial(v) },
    members(v) { this.syncMembers(v) },
  },
  methods: {
    // 用已有论文初始化表单
    initFromInitial(p) {
      if (!p) return
      const articleTypeIndex = Math.max(0, constants.ARTICLE_TYPES.indexOf(p.articleType))
      const casIndex = Math.max(0, constants.CAS_QUARTILES.indexOf(p.casQuartile))
      const jcrIndex = Math.max(0, constants.JCR_QUARTILES.indexOf(p.jcrQuartile))
      const categoryIndex = Math.max(0, CATEGORY_KEYS.indexOf(p.statusCategory))
      const visibilityIndex = Math.max(0, constants.VISIBILITIES.findIndex((v) => v.value === p.visibility))
      this.setData({
        title: p.title || '',
        journal: p.journal || '',
        articleTypeIndex,
        casIndex,
        jcrIndex,
        firstAuthors: p.firstAuthors || [],
        correspondingAuthors: p.correspondingAuthors || [],
        ownerIds: p.ownerIds || [],
        categoryIndex,
        currentStatus: p.currentStatus || '',
        submissionDate: p.submissionDate || '',
        revisionDeadline: p.revisionDeadline || '',
        manuscriptId: p.manuscriptId || '',
        doi: p.doi || '',
        note: p.note || '',
        visibilityIndex,
      })
      this.refreshCategory()
    },

    // 同步成员可选项（含选中态）
    syncMembers(members) {
      const ownerIds = this.data.ownerIds
      const memberOptions = (members || []).map((m) => ({
        userId: m.userId,
        nickname: m.nickname,
        selected: ownerIds.indexOf(m.userId) >= 0,
      }))
      this.setData({ memberOptions })
    },

    // 根据当前分类刷新常用状态建议与返修提示
    refreshCategory() {
      const key = CATEGORY_KEYS[this.data.categoryIndex]
      const suggestions = constants.COMMON_STATUSES
        .filter((s) => s.category === key)
        .map((s) => s.status)
      this.setData({ suggestions, isRevision: key === 'revision' })
    },

    // 文本/输入框
    onInput(e) {
      const field = e.currentTarget.dataset.field
      this.setData({ [field]: e.detail.value })
    },

    // 选择器
    onPickerChange(e) {
      const field = e.currentTarget.dataset.field
      const value = Number(e.detail.value)
      this.setData({ [field]: value })
      if (field === 'categoryIndex') this.refreshCategory()
    },

    // 日期选择器
    onDateChange(e) {
      const field = e.currentTarget.dataset.field
      this.setData({ [field]: e.detail.value })
    },

    // 第一作者
    onFirstAuthorInput(e) { this.setData({ firstAuthorInput: e.detail.value }) },
    addFirstAuthor() {
      const name = this.data.firstAuthorInput.trim()
      if (!name) return
      if (this.data.firstAuthors.indexOf(name) >= 0) { this.setData({ firstAuthorInput: '' }); return }
      this.setData({ firstAuthors: this.data.firstAuthors.concat(name), firstAuthorInput: '' })
    },

    // 通讯作者
    onCorrespondingAuthorInput(e) { this.setData({ correspondingAuthorInput: e.detail.value }) },
    addCorrespondingAuthor() {
      const name = this.data.correspondingAuthorInput.trim()
      if (!name) return
      if (this.data.correspondingAuthors.indexOf(name) >= 0) { this.setData({ correspondingAuthorInput: '' }); return }
      this.setData({ correspondingAuthors: this.data.correspondingAuthors.concat(name), correspondingAuthorInput: '' })
    },

    // 删除作者 chip
    removeChip(e) {
      const field = e.currentTarget.dataset.field
      const index = e.currentTarget.dataset.index
      const arr = this.data[field].slice()
      arr.splice(index, 1)
      this.setData({ [field]: arr })
    },

    // 负责人多选
    toggleOwner(e) {
      const id = e.currentTarget.dataset.id
      const ownerIds = this.data.ownerIds.slice()
      const idx = ownerIds.indexOf(id)
      if (idx >= 0) ownerIds.splice(idx, 1)
      else ownerIds.push(id)
      this.setData({ ownerIds })
      this.syncMembers(this.data.members)
    },

    // 点选常用状态
    pickSuggestion(e) {
      this.setData({ currentStatus: e.currentTarget.dataset.status })
    },

    // 提交
    onSubmit() {
      const d = this.data
      const title = d.title.trim()
      const journal = d.journal.trim()
      if (!title) { wx.showToast({ title: '请填写论文标题', icon: 'none' }); return }
      if (!journal) { wx.showToast({ title: '请填写投稿期刊', icon: 'none' }); return }

      const data = {
        title,
        journal,
        articleType: d.articleTypes[d.articleTypeIndex],
        casQuartile: d.casOptions[d.casIndex],
        jcrQuartile: d.jcrOptions[d.jcrIndex],
        firstAuthors: d.firstAuthors,
        correspondingAuthors: d.correspondingAuthors,
        ownerIds: d.ownerIds,
        statusCategory: CATEGORY_KEYS[d.categoryIndex],
        currentStatus: d.currentStatus.trim(),
        submissionDate: d.submissionDate,
        revisionDeadline: d.revisionDeadline,
        manuscriptId: d.manuscriptId.trim(),
        doi: d.doi.trim(),
        note: d.note,
        visibility: d.visibilities[d.visibilityIndex].value,
      }
      this.triggerEvent('submit', { data })
    },
  },
})
