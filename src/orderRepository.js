const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readOrders() {
  ensureDataDir();
  if (!fs.existsSync(ORDERS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

function createPending(order) {
  const orders = readOrders();
  if (orders.some(o => o.outTradeNo === order.outTradeNo)) {
    throw new Error(`订单已存在: ${order.outTradeNo}`);
  }
  orders.push({
    ...order,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  writeOrders(orders);
  return order;
}

function findByOutTradeNo(outTradeNo) {
  const orders = readOrders();
  return orders.find(o => o.outTradeNo === outTradeNo) || null;
}

function updateOrder(outTradeNo, updates) {
  const orders = readOrders();
  const index = orders.findIndex(o => o.outTradeNo === outTradeNo);
  if (index === -1) return null;
  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeOrders(orders);
  return orders[index];
}

function prepareFulfillment({ outTradeNo, tradeNo, expectedAmount, expectedResourceId, createResource }) {
  const order = findByOutTradeNo(outTradeNo);
  if (!order) return null;

  if (order.fulfillStatus === 'FULFILLED') {
    return {
      state: 'FULFILLED',
      serviceResult: order.serviceResult
    };
  }

  if (order.fulfillStatus === 'PENDING_CONFIRM') {
    return {
      state: 'PENDING_CONFIRM',
      serviceResult: order.serviceResult
    };
  }

  // 生成资源并进入待确认状态
  const serviceResult = createResource();
  updateOrder(outTradeNo, {
    orderStatus: 'PAID',
    fulfillStatus: 'PENDING_CONFIRM',
    tradeNo,
    serviceResult
  });

  return {
    state: 'PENDING_CONFIRM',
    serviceResult
  };
}

function markFulfilled(outTradeNo, tradeNo) {
  return updateOrder(outTradeNo, {
    fulfillStatus: 'FULFILLED',
    fulfilledAt: new Date().toISOString(),
    fulfillTradeNo: tradeNo
  });
}

module.exports = {
  createPending,
  findByOutTradeNo,
  prepareFulfillment,
  markFulfilled
};
