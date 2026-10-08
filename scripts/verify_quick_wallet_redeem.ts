// scripts/verify_quick_wallet_redeem.ts
import { serverPaperTrading } from '../src/lib/paperTradingService';
import { fromBaseUnits, toBaseUnits } from '../src/lib/tradeUnits';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

async function run() {
  console.log('\n======================================================');
  console.log('🧪 VERIFYING QUICK WALLET & BALANCE REDEMPTION SUITE');
  console.log('======================================================\n');

  const testUserId = `usr_test_redeem_${Date.now()}`;

  // 1. Initial Account Provisioning
  console.log('--- [TEST 1] Account Initialization & Solvency ---');
  const { account } = await serverPaperTrading.getOrCreateAccount(testUserId);
  const initialBalance = fromBaseUnits(BigInt(account.balance_units));
  assert(initialBalance === 10000, `Initial balance is exactly 10,000 USDT (got: ${initialBalance})`);

  // 2. Successful Redemption Execution
  console.log('\n--- [TEST 2] Balance Redemption with Integer Arithmetic ---');
  const redeemAmount = 750.50;
  const testAddress = 'TXh78aBCdE991ZkQ2w';
  const testNetwork = 'TRC-20';

  const result = await serverPaperTrading.redeemBalance(
    testUserId,
    redeemAmount,
    testAddress,
    testNetwork
  );

  assert(result.success === true, 'Redemption execution returned success: true');
  assert(!!result.account, 'Updated account record returned');
  assert(!!result.transaction, 'Immutable transaction record returned');
  assert(!!result.txHash && result.txHash.startsWith('0x'), `Cryptographic tx hash generated: ${result.txHash}`);

  const balanceAfter = fromBaseUnits(BigInt(result.account!.balance_units));
  const expectedBalance = 10000 - redeemAmount;
  assert(
    Math.abs(balanceAfter - expectedBalance) < 0.0001,
    `Balance correctly deducted: ${balanceAfter} USDT (expected: ${expectedBalance})`
  );

  // 3. Append-Only Immutable Ledger Record
  console.log('\n--- [TEST 3] Immutable Ledger Integrity ---');
  const tx = result.transaction!;
  assert(tx.type === 'withdrawal', `Transaction type is strictly 'withdrawal' (got: ${tx.type})`);
  assert(tx.symbol === 'USDT', 'Currency is USDT');
  assert(tx.amount_units === (-toBaseUnits(redeemAmount)).toString(), 'Delta amount is negative integer units');
  assert(
    tx.details?.destinationAddress === testAddress,
    `Destination address logged: ${tx.details?.destinationAddress}`
  );
  assert(tx.details?.network === testNetwork, `Network logged: ${tx.details?.network}`);
  assert(tx.details?.status === 'confirmed', 'Status marked confirmed');

  // 4. Solvency Rejection Guard
  console.log('\n--- [TEST 4] Solvency Protection (Cannot Overdraw) ---');
  const overdrawAmount = 50000; // Far exceeds available ~9,249.50 USDT
  const overdrawResult = await serverPaperTrading.redeemBalance(
    testUserId,
    overdrawAmount,
    testAddress,
    testNetwork
  );

  assert(overdrawResult.success === false, 'Overdraw redemption was safely rejected');
  assert(
    overdrawResult.error?.includes('Insufficient balance') || false,
    `Clear error message returned: "${overdrawResult.error}"`
  );

  // Verify balance untouched after failed redemption
  const { account: recheckedAcc } = await serverPaperTrading.getOrCreateAccount(testUserId);
  const recheckedBalance = fromBaseUnits(BigInt(recheckedAcc.balance_units));
  assert(
    Math.abs(recheckedBalance - balanceAfter) < 0.0001,
    `Account balance protected and unchanged: ${recheckedBalance} USDT`
  );

  // 5. Quick Deposit / Top-up
  console.log('\n--- [TEST 5] Quick Deposit / Top-up Ledger ---');
  const depositAmount = 2000;
  const depositRes = await serverPaperTrading.quickDeposit(testUserId, depositAmount, 'Voucher Credit');
  assert(depositRes.success === true, 'Deposit execution succeeded');
  assert(depositRes.transaction?.type === 'deposit', "Deposit transaction type is 'deposit'");

  const balanceAfterDeposit = fromBaseUnits(BigInt(depositRes.account!.balance_units));
  assert(
    Math.abs(balanceAfterDeposit - (balanceAfter + depositAmount)) < 0.0001,
    `Balance successfully increased: ${balanceAfterDeposit} USDT`
  );

  console.log('\n======================================================');
  console.log(`🏁 TEST COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
