const express = require('express');
const { createA2MRouter, CONFIG } = require('./src/a2mService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AI 按量付费路由
app.use(createA2MRouter());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 根路径说明
app.get('/', (req, res) => {
  res.json({
    service: 'AI 按量付费示例服务',
    endpoints: {
      resource: CONFIG.resource.path,
      health: '/health'
    },
    note: '访问资源接口时，未支付将返回 HTTP 402 + Payment-Needed Header'
  });
});

app.listen(PORT, () => {
  console.log(`A2M 按量付费服务已启动：http://localhost:${PORT}`);
  console.log(`资源接口：http://localhost:${PORT}${CONFIG.resource.path}`);
  console.log(`健康检查：http://localhost:${PORT}/health`);
});
