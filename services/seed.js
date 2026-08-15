// Mock 种子数据（测试号阶段使用）
//
// 设计要点：
// 1. 所有时间相对当前时刻生成，保证「今天 10:26 / 昨天 16:42 / 8月12日」等相对时间展示正确；
// 2. 内置两个课题组（刘洋课题组 / 王建国课题组）演示数据隔离；
// 3. 刘洋（当前用户）在「刘洋课题组」为管理员、在「王建国课题组」为观察者，演示多团队与只读权限。

function pad(n) { return n < 10 ? '0' + n : '' + n }

function hoursAgo(h) { return Date.now() - h * 3600 * 1000 }
function daysAgo(d, h) { return Date.now() - (d * 24 + (h || 0)) * 3600 * 1000 }

// 距现在 d 天后的日期（用于返修截止）
function daysFromNow(d) {
  const t = new Date(Date.now() + d * 24 * 3600 * 1000)
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
}

// 距现在 d 天前的日期字符串（用于投稿日期）
function dateAgo(d) {
  const t = new Date(Date.now() - d * 24 * 3600 * 1000)
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
}

function build() {
  const users = [
    { id: 'user_001', openid: 'mock_openid_001', nickname: '刘洋', avatarUrl: '', createdAt: daysAgo(120), updatedAt: daysAgo(2) },
    { id: 'user_002', openid: 'mock_openid_002', nickname: '陶龙飞', avatarUrl: '', createdAt: daysAgo(110), updatedAt: hoursAgo(2) },
    { id: 'user_003', openid: 'mock_openid_003', nickname: '张三', avatarUrl: '', createdAt: daysAgo(100), updatedAt: hoursAgo(20) },
    { id: 'user_004', openid: 'mock_openid_004', nickname: '李四', avatarUrl: '', createdAt: daysAgo(95), updatedAt: daysAgo(3) },
    { id: 'user_005', openid: 'mock_openid_005', nickname: '王五', avatarUrl: '', createdAt: daysAgo(90), updatedAt: daysAgo(1) },
    { id: 'user_006', openid: 'mock_openid_006', nickname: '王建国', avatarUrl: '', createdAt: daysAgo(80), updatedAt: daysAgo(1) },
    { id: 'user_007', openid: 'mock_openid_007', nickname: '赵敏', avatarUrl: '', createdAt: daysAgo(60), updatedAt: daysAgo(1) },
  ]

  const teams = [
    { id: 'team_001', name: '刘洋课题组', ownerId: 'user_001', organization: '厦门大学 护理学院', description: '肿瘤护理与老年慢病管理研究', inviteCode: 'PT8K26', createdAt: daysAgo(120), updatedAt: daysAgo(2) },
    { id: 'team_002', name: '王建国课题组', ownerId: 'user_006', organization: '南方医科大学 护理学院', description: '循证护理与慢性病管理', inviteCode: 'PT9M37', createdAt: daysAgo(80), updatedAt: daysAgo(1) },
  ]

  const members = [
    { id: 'mem_001', teamId: 'team_001', userId: 'user_001', role: 'admin', joinedAt: daysAgo(120) },
    { id: 'mem_002', teamId: 'team_001', userId: 'user_002', role: 'member', joinedAt: daysAgo(110) },
    { id: 'mem_003', teamId: 'team_001', userId: 'user_003', role: 'member', joinedAt: daysAgo(100) },
    { id: 'mem_004', teamId: 'team_001', userId: 'user_004', role: 'member', joinedAt: daysAgo(95) },
    { id: 'mem_005', teamId: 'team_001', userId: 'user_005', role: 'member', joinedAt: daysAgo(90) },
    { id: 'mem_006', teamId: 'team_002', userId: 'user_006', role: 'admin', joinedAt: daysAgo(80) },
    { id: 'mem_007', teamId: 'team_002', userId: 'user_007', role: 'member', joinedAt: daysAgo(60) },
    { id: 'mem_008', teamId: 'team_002', userId: 'user_001', role: 'viewer', joinedAt: daysAgo(30) },
  ]

  const papers = []
  const statusHistory = []
  const activities = []

  // 构建一篇论文：自动生成其状态历史 + 最近动态
  function addPaper(spec) {
    const id = spec.id
    // 状态历史（按时间升序）
    ;(spec.history || []).forEach((h, i) => {
      statusHistory.push({
        id: `${id}_h${i + 1}`,
        teamId: 'team_001',
        paperId: id,
        status: h[0],
        statusCategory: h[1],
        operatorId: spec.ownerIds[0],
        createdAt: h[2],
      })
    })
    papers.push({
      id,
      teamId: 'team_001',
      title: spec.title,
      journal: spec.journal,
      articleType: spec.articleType,
      casQuartile: spec.cas,
      jcrQuartile: spec.jcr,
      firstAuthors: spec.firstAuthors,
      correspondingAuthors: spec.correspondingAuthors,
      ownerIds: spec.ownerIds,
      submissionDate: spec.submissionDate,
      manuscriptId: spec.manuscriptId || '',
      doi: spec.doi || '',
      currentStatus: spec.currentStatus,
      statusCategory: spec.statusCategory,
      revisionDeadline: spec.revisionDeadline || '',
      note: spec.note || '',
      visibility: 'team',
      createdBy: spec.createdBy,
      createdAt: spec.createdAt,
      updatedAt: spec.updatedAt,
      deletedAt: null,
    })

    // 最近动态：新增论文
    activities.push({
      id: `${id}_created`,
      teamId: 'team_001',
      paperId: id,
      userId: spec.createdBy,
      actionType: 'paper_created',
      beforeValue: '',
      afterValue: '',
      createdAt: spec.createdAt,
    })

    // 最近动态：最近一次状态变化
    const last = spec.history[spec.history.length - 1]
    const prev = spec.history[spec.history.length - 2]
    if (last) {
      activities.push({
        id: `${id}_last`,
        teamId: 'team_001',
        paperId: id,
        userId: spec.ownerIds[0],
        actionType: 'status_changed',
        beforeValue: prev ? prev[0] : '',
        afterValue: last[0],
        createdAt: last[2],
      })
    }
  }

  // ============ 刘洋课题组（team_001）12 篇论文 ============
  addPaper({
    id: 'paper_001', title: 'Development and Preliminary Evaluation of a Clinician-Supervised Symptom Management Program for Patients Receiving Immune Checkpoint Inhibitors',
    journal: 'European Journal of Oncology Nursing', articleType: 'Original Article', cas: '2区', jcr: 'Q1',
    firstAuthors: ['陶龙飞'], correspondingAuthors: ['刘洋'], ownerIds: ['user_002'],
    submissionDate: dateAgo(26), manuscriptId: 'EJON-D-26-01234', doi: '',
    currentStatus: 'Under Review', statusCategory: 'review',
    note: '外审阶段，等待审稿人意见。', createdBy: 'user_002', createdAt: daysAgo(26), updatedAt: hoursAgo(2),
    history: [['Submitted', 'submitted', daysAgo(26)], ['With Editor', 'editorial', daysAgo(24)], ['Under Review', 'review', hoursAgo(2)]],
  })
  addPaper({
    id: 'paper_002', title: 'Effects of a Nurse-Led Early Mobilization Program on Postoperative Recovery in Patients Undergoing Major Abdominal Surgery: A Randomized Controlled Trial',
    journal: 'Journal of Advanced Nursing', articleType: 'Original Article', cas: '1区', jcr: 'Q1',
    firstAuthors: ['张三'], correspondingAuthors: ['刘洋'], ownerIds: ['user_003'],
    submissionDate: dateAgo(40), manuscriptId: 'JAN-2026-0888', doi: '',
    currentStatus: 'Major Revision', statusCategory: 'revision', revisionDeadline: daysFromNow(12),
    note: '三位审稿人均要求补充统计分析细节。', createdBy: 'user_003', createdAt: daysAgo(40), updatedAt: hoursAgo(20),
    history: [['Submitted', 'submitted', daysAgo(40)], ['Under Review', 'review', daysAgo(32)], ['Required Reviews Completed', 'review', daysAgo(5)], ['Major Revision', 'revision', hoursAgo(20)]],
  })
  addPaper({
    id: 'paper_003', title: 'Association Between Frailty and Adverse Outcomes in Older Adults Undergoing Elective Surgery: A Prospective Cohort Study',
    journal: 'Aging Clinical and Experimental Research', articleType: 'Original Article', cas: '3区', jcr: 'Q2',
    firstAuthors: ['李四'], correspondingAuthors: ['刘洋'], ownerIds: ['user_004'],
    submissionDate: dateAgo(60), manuscriptId: 'ACER-D-26-0456', doi: '',
    currentStatus: 'Accepted', statusCategory: 'accepted',
    note: '已接收，等待排版。', createdBy: 'user_004', createdAt: daysAgo(60), updatedAt: daysAgo(3),
    history: [['Submitted', 'submitted', daysAgo(60)], ['Under Review', 'review', daysAgo(50)], ['Minor Revision', 'revision', daysAgo(15)], ['Revision Submitted', 'revision', daysAgo(8)], ['Accepted', 'accepted', daysAgo(3)]],
  })
  addPaper({
    id: 'paper_004', title: '护理本科生职业认同与临床实践环境的相关性研究',
    journal: '中华护理杂志', articleType: 'Original Article', cas: '暂未填写', jcr: '暂未填写',
    firstAuthors: ['王五'], correspondingAuthors: ['刘洋'], ownerIds: ['user_005'],
    submissionDate: dateAgo(90), manuscriptId: 'ZHHL-2026-1120', doi: '',
    currentStatus: 'Published', statusCategory: 'published',
    note: '已见刊。', createdBy: 'user_005', createdAt: daysAgo(90), updatedAt: daysAgo(10),
    history: [['Submitted', 'submitted', daysAgo(90)], ['Under Review', 'review', daysAgo(80)], ['Accepted', 'accepted', daysAgo(30)], ['Published', 'published', daysAgo(10)]],
  })
  addPaper({
    id: 'paper_005', title: 'Prevalence and Risk Factors of Workplace Violence Against Nurses in Emergency Departments: A Multicenter Cross-Sectional Study',
    journal: 'Journal of Clinical Nursing', articleType: 'Original Article', cas: '2区', jcr: 'Q1',
    firstAuthors: ['陶龙飞'], correspondingAuthors: ['刘洋'], ownerIds: ['user_002'],
    submissionDate: dateAgo(50), manuscriptId: 'JCN-26-3321', doi: '',
    currentStatus: 'Under Review', statusCategory: 'review',
    note: '', createdBy: 'user_002', createdAt: daysAgo(50), updatedAt: daysAgo(6),
    history: [['Submitted', 'submitted', daysAgo(50)], ['With Editor', 'editorial', daysAgo(48)], ['Under Review', 'review', daysAgo(35)]],
  })
  addPaper({
    id: 'paper_006', title: 'A Scoping Review of Digital Health Interventions for Chronic Wound Management in Home Care Settings',
    journal: 'Journal of Medical Internet Research', articleType: 'Review', cas: '1区', jcr: 'Q1',
    firstAuthors: ['张三', '李四'], correspondingAuthors: ['刘洋'], ownerIds: ['user_003', 'user_004'],
    submissionDate: dateAgo(9), manuscriptId: 'JMIR-2026-5123', doi: '',
    currentStatus: 'With Editor', statusCategory: 'editorial',
    note: '编辑处理中。', createdBy: 'user_003', createdAt: daysAgo(9), updatedAt: daysAgo(3),
    history: [['Submitted', 'submitted', daysAgo(9)], ['With Editor', 'editorial', daysAgo(3)]],
  })
  addPaper({
    id: 'paper_007', title: 'Mindfulness-Based Intervention for Reducing Caregiver Burden Among Family Caregivers of Patients with Advanced Cancer: A Pilot Study',
    journal: 'Journal of Psychosocial Oncology', articleType: 'Original Article', cas: '2区', jcr: 'Q2',
    firstAuthors: ['李四'], correspondingAuthors: ['刘洋'], ownerIds: ['user_004'],
    submissionDate: dateAgo(2), manuscriptId: 'JPO-26-0998', doi: '',
    currentStatus: 'Submitted', statusCategory: 'submitted',
    note: '刚完成投稿。', createdBy: 'user_004', createdAt: daysAgo(2), updatedAt: daysAgo(2),
    history: [['Submitted', 'submitted', daysAgo(2)]],
  })
  addPaper({
    id: 'paper_008', title: 'Nomogram for Predicting Prolonged Length of Stay After Colorectal Cancer Surgery: A Retrospective Analysis',
    journal: 'BMJ Open', articleType: 'Original Article', cas: '2区', jcr: 'Q2',
    firstAuthors: ['王五'], correspondingAuthors: ['刘洋'], ownerIds: ['user_005'],
    submissionDate: dateAgo(45), manuscriptId: 'bmjopen-2026-0987', doi: '',
    currentStatus: 'Required Reviews Completed', statusCategory: 'review',
    note: '审稿完成，等待编辑决定。', createdBy: 'user_005', createdAt: daysAgo(45), updatedAt: daysAgo(1),
    history: [['Submitted', 'submitted', daysAgo(45)], ['With Editor', 'editorial', daysAgo(43)], ['Under Review', 'review', daysAgo(30)], ['Required Reviews Completed', 'review', daysAgo(1)]],
  })
  addPaper({
    id: 'paper_009', title: 'Association of Sleep Quality with Glycemic Control in Patients with Type 2 Diabetes: A Cross-Sectional Study',
    journal: 'Diabetes Research and Clinical Practice', articleType: 'Original Article', cas: '2区', jcr: 'Q1',
    firstAuthors: ['陶龙飞'], correspondingAuthors: ['刘洋'], ownerIds: ['user_002'],
    submissionDate: dateAgo(70), manuscriptId: 'DRCP-D-26-1876', doi: '',
    currentStatus: 'Rejected', statusCategory: 'rejected',
    note: '转投其他期刊。', createdBy: 'user_002', createdAt: daysAgo(70), updatedAt: daysAgo(15),
    history: [['Submitted', 'submitted', daysAgo(70)], ['Under Review', 'review', daysAgo(60)], ['Rejected', 'rejected', daysAgo(15)]],
  })
  addPaper({
    id: 'paper_010', title: "Patients' Experiences of Shared Decision-Making in Cancer Care: A Qualitative Descriptive Study",
    journal: 'Qualitative Health Research', articleType: 'Original Article', cas: '2区', jcr: 'Q1',
    firstAuthors: ['张三'], correspondingAuthors: ['刘洋'], ownerIds: ['user_003'],
    submissionDate: dateAgo(55), manuscriptId: 'QHR-26-0211', doi: '',
    currentStatus: 'Revision Submitted', statusCategory: 'revision', revisionDeadline: daysFromNow(5),
    note: '小修已提交。', createdBy: 'user_003', createdAt: daysAgo(55), updatedAt: daysAgo(4),
    history: [['Submitted', 'submitted', daysAgo(55)], ['Under Review', 'review', daysAgo(42)], ['Minor Revision', 'revision', daysAgo(10)], ['Revision Submitted', 'revision', daysAgo(4)]],
  })
  addPaper({
    id: 'paper_011', title: 'Machine Learning Models for Predicting Unplanned Hospital Readmission in Heart Failure Patients: A Systematic Review and Meta-Analysis',
    journal: 'International Journal of Medical Informatics', articleType: 'Meta-analysis', cas: '1区', jcr: 'Q1',
    firstAuthors: ['李四'], correspondingAuthors: ['刘洋'], ownerIds: ['user_004'],
    submissionDate: dateAgo(38), manuscriptId: 'IJMI-D-26-1453', doi: '',
    currentStatus: 'Under Review', statusCategory: 'review',
    note: '', createdBy: 'user_004', createdAt: daysAgo(38), updatedAt: daysAgo(8),
    history: [['Submitted', 'submitted', daysAgo(38)], ['With Editor', 'editorial', daysAgo(36)], ['Under Review', 'review', daysAgo(20)]],
  })
  addPaper({
    id: 'paper_012', title: 'Interventions to Improve Medication Adherence in Patients with Heart Failure: A Systematic Review and Meta-Analysis',
    journal: 'European Journal of Cardiovascular Nursing', articleType: 'Meta-analysis', cas: '2区', jcr: 'Q1',
    firstAuthors: ['王五'], correspondingAuthors: ['刘洋'], ownerIds: ['user_005'],
    submissionDate: '', manuscriptId: '', doi: '',
    currentStatus: 'Preparing', statusCategory: 'preparing',
    note: '正在整理数据，准备撰写。', createdBy: 'user_005', createdAt: daysAgo(20), updatedAt: daysAgo(5),
    history: [['Preparing', 'preparing', daysAgo(20)]],
  })

  // ============ 王建国课题组（team_002）2 篇论文（演示隔离） ============
  papers.push({
    id: 'paper_101', teamId: 'team_002',
    title: 'Effectiveness of a WeChat-Based Self-Management Intervention for Patients with Chronic Obstructive Pulmonary Disease: A Randomized Controlled Trial',
    journal: 'International Journal of Nursing Studies', articleType: 'Original Article', cas: '1区', jcr: 'Q1',
    firstAuthors: ['赵敏'], correspondingAuthors: ['王建国'], ownerIds: ['user_007'],
    submissionDate: dateAgo(20), manuscriptId: 'IJNS-D-26-3344', doi: '',
    currentStatus: 'Under Review', statusCategory: 'review',
    revisionDeadline: '', note: '', visibility: 'team', createdBy: 'user_007', createdAt: daysAgo(20), updatedAt: daysAgo(5), deletedAt: null,
  })
  statusHistory.push(
    { id: 'paper_101_h1', teamId: 'team_002', paperId: 'paper_101', status: 'Submitted', statusCategory: 'submitted', operatorId: 'user_007', createdAt: daysAgo(20) },
    { id: 'paper_101_h2', teamId: 'team_002', paperId: 'paper_101', status: 'Under Review', statusCategory: 'review', operatorId: 'user_007', createdAt: daysAgo(5) },
  )
  papers.push({
    id: 'paper_102', teamId: 'team_002',
    title: 'Barriers and Facilitators to Physical Activity Among Stroke Survivors: A Systematic Review of Qualitative Studies',
    journal: 'Disability and Rehabilitation', articleType: 'Review', cas: '3区', jcr: 'Q2',
    firstAuthors: ['赵敏'], correspondingAuthors: ['王建国'], ownerIds: ['user_007'],
    submissionDate: dateAgo(50), manuscriptId: 'DRE-26-7788', doi: '',
    currentStatus: 'Accepted', statusCategory: 'accepted',
    revisionDeadline: '', note: '', visibility: 'team', createdBy: 'user_007', createdAt: daysAgo(50), updatedAt: daysAgo(7), deletedAt: null,
  })
  statusHistory.push(
    { id: 'paper_102_h1', teamId: 'team_002', paperId: 'paper_102', status: 'Submitted', statusCategory: 'submitted', operatorId: 'user_007', createdAt: daysAgo(50) },
    { id: 'paper_102_h2', teamId: 'team_002', paperId: 'paper_102', status: 'Under Review', statusCategory: 'review', operatorId: 'user_007', createdAt: daysAgo(40) },
    { id: 'paper_102_h3', teamId: 'team_002', paperId: 'paper_102', status: 'Accepted', statusCategory: 'accepted', operatorId: 'user_007', createdAt: daysAgo(7) },
  )

  return {
    users,
    teams,
    members,
    papers,
    statusHistory,
    activities,
    meta: { currentUserId: 'user_001', currentTeamId: 'team_001' },
  }
}

module.exports = { build }
