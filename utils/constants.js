// 全局常量与状态映射（集中管理，避免散落各处导致不一致）

// 投稿状态中文分类：statusCategory -> { 中文标签, 主题色 }
// 颜色为低饱和、克制的学术配色，避免高饱和刺眼
const STATUS_CATEGORIES = {
  preparing: { label: '准备中',   color: '#6B7686' },
  submitted: { label: '已投稿',   color: '#4A7BB8' },
  editorial: { label: '编辑处理中', color: '#4F6D95' },
  review:    { label: '审稿中',   color: '#5B6AB8' },
  revision:  { label: '返修中',   color: '#C08A3E' },
  accepted:  { label: '已接收',   color: '#3F8E5F' },
  published: { label: '已发表',   color: '#2E7D52' },
  rejected:  { label: '已拒稿',   color: '#B5584E' },
  withdrawn: { label: '已撤稿',   color: '#8A8F98' },
}

// 分类展示顺序（用于统计、筛选排序）
const STATUS_CATEGORY_ORDER = [
  'preparing', 'submitted', 'editorial', 'review',
  'revision', 'accepted', 'published', 'rejected', 'withdrawn',
]

// 常见投稿系统状态（英文原文 -> 中文分类），用于快速选择
const COMMON_STATUSES = [
  { status: 'Preparing', category: 'preparing' },
  { status: 'Ready to Submit', category: 'preparing' },
  { status: 'Submitted', category: 'submitted' },
  { status: 'With Editor', category: 'editorial' },
  { status: 'Editor Assigned', category: 'editorial' },
  { status: 'Editor Invited', category: 'editorial' },
  { status: 'Under Review', category: 'review' },
  { status: 'Peer Review', category: 'review' },
  { status: 'Interactive Review', category: 'review' },
  { status: 'Awaiting Reviewer Scores', category: 'review' },
  { status: 'Required Reviews Completed', category: 'review' },
  { status: 'Decision in Process', category: 'review' },
  { status: 'Major Revision', category: 'revision' },
  { status: 'Minor Revision', category: 'revision' },
  { status: 'Revision', category: 'revision' },
  { status: 'Revision Submitted', category: 'revision' },
  { status: 'Accepted', category: 'accepted' },
  { status: 'Published', category: 'published' },
  { status: 'Rejected', category: 'rejected' },
  { status: 'Withdrawn', category: 'withdrawn' },
]

// 中科院分区 / JCR 分区 / 论文类型
const CAS_QUARTILES = ['1区', '2区', '3区', '4区', '暂未填写']
const JCR_QUARTILES = ['Q1', 'Q2', 'Q3', 'Q4', '暂未填写']
const ARTICLE_TYPES = [
  'Original Article', 'Review', 'Meta-analysis',
  'Protocol', 'Letter', 'Case Report', 'Other',
]

// 成员角色
const ROLES = { admin: '管理员', member: '成员', viewer: '观察者' }

// 可见性选项
const VISIBILITIES = [
  { value: 'team', label: '课题组可见' },
  { value: 'private', label: '仅负责人和管理员可见' },
]

// 根据分类 key 取中文标签
function categoryLabel(category) {
  const c = STATUS_CATEGORIES[category]
  return c ? c.label : (category || '未分类')
}

// 根据分类 key 取主题色
function categoryColor(category) {
  const c = STATUS_CATEGORIES[category]
  return c ? c.color : '#6B7686'
}

module.exports = {
  STATUS_CATEGORIES,
  STATUS_CATEGORY_ORDER,
  COMMON_STATUSES,
  CAS_QUARTILES,
  JCR_QUARTILES,
  ARTICLE_TYPES,
  ROLES,
  VISIBILITIES,
  categoryLabel,
  categoryColor,
}
