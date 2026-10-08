import { GET as adminGet } from '../src/app/api/admin/route';
import { POST as orderPost } from '../src/app/api/trade/order/route';
import { NextRequest } from 'next/server';

async function testApiRoutes() {
  console.log('====================================================');
  console.log('🛡️ TESTING ADMIN & TRADE ROUTE AUTHORIZATION CHECKS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
    }
  }

  // TEST 1: Non-admin calling /api/admin gets 403 Forbidden
  const unauthorizedReq = new NextRequest('http://localhost:3000/api/admin', {
    headers: {
      'x-user-role': 'user',
      'x-user-id': 'usr_regular_trader',
    },
  });
  const unauthRes = await adminGet(unauthorizedReq);
  assert(
    unauthRes.status === 403,
    `Test 1: Non-admin calling GET /api/admin returns 403 Forbidden (got ${unauthRes.status})`
  );

  // TEST 2: Admin calling /api/admin gets 200 OK
  const adminReq = new NextRequest('http://localhost:3000/api/admin', {
    headers: {
      'x-user-role': 'admin',
      'x-user-id': 'usr_celsius_demo',
      'x-user-email': 'admin@celsius.trade',
    },
  });
  const adminRes = await adminGet(adminReq);
  assert(
    adminRes.status === 200,
    `Test 2: Authorized admin calling GET /api/admin returns 200 OK (got ${adminRes.status})`
  );

  // TEST 3: Frozen user calling /api/trade/order gets 403 Forbidden
  const frozenTradeReq = new NextRequest('http://localhost:3000/api/trade/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr_bad_actor', // Suspended / frozen user
    },
    body: JSON.stringify({
      symbol: 'BTCUSDT',
      side: 'buy',
      amount: 0.1,
    }),
  });
  const frozenRes = await orderPost(frozenTradeReq);
  const frozenData = await frozenRes.json();
  assert(
    frozenRes.status === 403 && frozenData.code === 'ACCOUNT_FROZEN',
    `Test 3: Frozen user submitting order returns 403 Forbidden [ACCOUNT_FROZEN] (got ${frozenRes.status})`
  );

  // TEST 4: Active user calling /api/trade/order succeeds
  const activeTradeReq = new NextRequest('http://localhost:3000/api/trade/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr_celsius_demo', // Active user
    },
    body: JSON.stringify({
      symbol: 'BTCUSDT',
      side: 'buy',
      amount: 0.05,
    }),
  });
  const activeRes = await orderPost(activeTradeReq);
  const activeData = await activeRes.json();
  assert(
    activeRes.status === 200 && activeData.success === true,
    `Test 4: Active user submitting order returns 200 OK (fill price: $${activeData.fillPrice}, fee: $${activeData.fee})`
  );

  console.log(`\n====================================================`);
  console.log(`RESULTS: ${passed}/${total} API Authorization Tests Passed!`);
  console.log(`====================================================\n`);

  if (passed === total) process.exit(0);
  else process.exit(1);
}

testApiRoutes().catch((e) => {
  console.error(e);
  process.exit(1);
});
