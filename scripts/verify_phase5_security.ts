import { adminService } from '../src/lib/adminService';

async function runSecurityTests() {
  console.log('====================================================');
  console.log('🔒 RUNNING PHASE 5 SECURITY INVARIANT VERIFICATION');
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

  // TEST 1: Frozen User Check
  const badActorId = 'usr_bad_actor';
  assert(adminService.isUserFrozen(badActorId) === true, 'Test 1: Bad actor is frozen by default');

  // TEST 2: Admin Audit Log Appending on Freeze
  const initialAuditCount = adminService.getAuditLogs().length;
  adminService.updateUserStatus('usr_trader_5', 'suspended', 'admin_1', 'admin@celsius.trade');
  const afterFreezeAuditCount = adminService.getAuditLogs().length;

  assert(
    afterFreezeAuditCount === initialAuditCount + 1,
    'Test 2: Freezing a user writes an immutable record to admin_audit_log'
  );

  const latestLog = adminService.getAuditLogs()[0];
  assert(
    latestLog.action === 'FREEZE_USER' && latestLog.target === 'user:usr_trader_5',
    'Test 3: Audit log details match action FREEZE_USER and target'
  );

  assert(
    adminService.isUserFrozen('usr_trader_5') === true,
    'Test 4: User is now frozen in server-side state'
  );

  // TEST 5: Unfreeze User
  adminService.updateUserStatus('usr_trader_5', 'active', 'admin_1', 'admin@celsius.trade');
  assert(
    adminService.isUserFrozen('usr_trader_5') === false,
    'Test 5: Unfreeze restores active trading status'
  );
  assert(
    adminService.getAuditLogs()[0].action === 'UNFREEZE_USER',
    'Test 6: Unfreezing is logged in admin_audit_log'
  );

  // TEST 6: Feature Flag Toggle Logging
  const flagInitialCount = adminService.getAuditLogs().length;
  adminService.toggleFeatureFlag('paper_trading', false, 'admin_1', 'admin@celsius.trade');
  assert(
    adminService.isFeatureEnabled('paper_trading') === false,
    'Test 7: Feature flag paper_trading toggled off'
  );
  assert(
    adminService.getAuditLogs().length === flagInitialCount + 1,
    'Test 8: Feature flag modification logged in audit trail'
  );

  // Restore flag
  adminService.toggleFeatureFlag('paper_trading', true, 'admin_1', 'admin@celsius.trade');
  assert(
    adminService.isFeatureEnabled('paper_trading') === true,
    'Test 9: Feature flag restored to enabled'
  );

  // TEST 7: Announcement Creation Logging
  adminService.addAnnouncement(
    {
      title: 'Security Drill Complete',
      text: 'Phase 5 administrative security gate verified.',
      type: 'critical',
      dismissible: false,
      active: true,
    },
    'admin_1',
    'admin@celsius.trade'
  );
  assert(
    adminService.getAuditLogs()[0].action === 'CREATE_ANNOUNCEMENT',
    'Test 10: Announcement creation logged in audit trail'
  );

  // TEST 8: Broadcast Message Logging
  adminService.sendBroadcastMessage(
    'usr_celsius_demo',
    'admin_1',
    'admin@celsius.trade',
    'Security Notice',
    'All role-based gates are active.'
  );
  assert(
    adminService.getAuditLogs()[0].action === 'BROADCAST_MESSAGE',
    'Test 11: Broadcast message logged in audit trail'
  );

  // TEST 9: Unread Broadcast Retrieval
  const userBroadcasts = adminService.getUserBroadcasts('usr_celsius_demo');
  assert(
    userBroadcasts.length > 0 && userBroadcasts[0].title === 'Security Notice',
    'Test 12: Trader can retrieve unread broadcast messages'
  );

  console.log(`\n====================================================`);
  console.log(`RESULTS: ${passed}/${total} Security Invariant Tests Passed!`);
  console.log(`====================================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSecurityTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
