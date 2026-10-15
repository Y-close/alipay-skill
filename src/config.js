const fs = require('fs');
const path = require('path');

function loadConfig() {
  const config = {
    alipay: {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
      gateway: process.env.ALIPAY_GATEWAY || 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
      sellerId: process.env.ALIPAY_SELLER_ID || '',
      serviceId: process.env.ALIPAY_SERVICE_ID || 'api_mock_service_id',
      merchantPrivateKey: process.env.ALIPAY_MERCHANT_PRIVATE_KEY || ''
    },
    resource: {
      path: '/demo/a2m/resource',
      goodsName: 'AI 生成内容服务'
    }
  };

  // 尝试从项目根目录读取沙箱配置文件
  const sandboxPath = path.join(__dirname, '..', '.alipay-sandbox.json');
  if (fs.existsSync(sandboxPath)) {
    try {
      const sandbox = JSON.parse(fs.readFileSync(sandboxPath, 'utf8'));
      if (sandbox.appId) config.alipay.appId = sandbox.appId;
      if (sandbox.appPrivatePkcsKey) config.alipay.privateKey = sandbox.appPrivatePkcsKey;
      if (sandbox.alipayPublicKey) config.alipay.alipayPublicKey = sandbox.alipayPublicKey;
      if (sandbox.gateway) config.alipay.gateway = sandbox.gateway;
      if (sandbox.sellerId) config.alipay.sellerId = sandbox.sellerId;
      if (sandbox.serviceId) config.alipay.serviceId = sandbox.serviceId;
      if (sandbox.appPrivatePkcsKey) config.alipay.merchantPrivateKey = sandbox.appPrivatePkcsKey;
    } catch (e) {
      console.warn('沙箱配置文件解析失败，使用环境变量配置');
    }
  }

  const required = ['appId', 'privateKey', 'alipayPublicKey', 'sellerId'];
  const missing = required.filter(k => !config.alipay[k]);
  if (missing.length > 0) {
    config.alipay._configError = `支付宝沙箱/生产配置缺失: ${missing.join(', ')}。请设置环境变量或提供 .alipay-sandbox.json 配置文件。`;
  } else {
    config.alipay._configError = null;
  }

  return config;
}

module.exports = { loadConfig };
