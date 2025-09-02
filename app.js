App({
  onLaunch() {
    // 初始化微信云能力（必须在调用 wx.cloud.callFunction 之前运行）
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上基础库以支持 cloud 功能');
      return;
    }

    // 不传 env 时会使用微信开发者工具中选定的默认环境；
    // 若需要显式指定，请替换下面的 env 值为你的环境 ID（如 cloud1-xxxxx）
    wx.cloud.init({
      // env: 'your-env-id',
      traceUser: true
    });
  }
})
