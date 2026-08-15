// app.js
const storage = require('./services/storage')

App({
  onLaunch() {
    // 首次进入自动生成 Mock 数据（测试号阶段）
    storage.getDB()
  },
  globalData: {},
})
