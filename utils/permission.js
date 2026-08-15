// 权限判断工具（集中管理，避免在各页面散落重复判断）

// 是否管理员（可管理团队、编辑本组所有论文）
function isAdmin(role) { return role === 'admin' }

// 是否观察者（只读）
function isViewer(role) { return role === 'viewer' }

// 当前用户在某团队中的角色；未加入返回 null
function getRoleInTeam(members, userId) {
  const m = (members || []).find((x) => x.userId === userId)
  return m ? m.role : null
}

// 能否编辑论文：管理员可编辑本组所有；成员仅编辑自己负责的；观察者只读
function canEditPaper(role, userId, paper) {
  if (!paper) return false
  if (role === 'admin') return true
  if (role === 'member' && (paper.ownerIds || []).indexOf(userId) >= 0) return true
  return false
}

// 能否查看论文：'team' 全组可见；'private' 仅负责人与管理员
function canViewPaper(role, userId, paper) {
  if (!paper) return false
  if (paper.visibility === 'private') {
    if (role === 'admin') return true
    return (paper.ownerIds || []).indexOf(userId) >= 0
  }
  return true
}

// 能否管理成员（仅管理员）
function canManageTeam(role) { return role === 'admin' }

module.exports = {
  isAdmin,
  isViewer,
  getRoleInTeam,
  canEditPaper,
  canViewPaper,
  canManageTeam,
}
