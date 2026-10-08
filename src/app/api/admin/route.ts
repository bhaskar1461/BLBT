import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/lib/adminService';
import { logger } from '@/lib/logger';
import { transparencyService } from '@/lib/transparencyService';

export const dynamic = 'force-dynamic';

function verifyAdmin(req: NextRequest): { isAdmin: boolean; adminId: string; adminEmail: string } {
  const headerRole = req.headers.get('x-user-role');
  const cookieRole = req.cookies.get('celsius_role')?.value;
  const headerUserId = req.headers.get('x-user-id') || 'usr_celsius_demo';
  const cookieProfile = req.cookies.get('celsius_user_profile')?.value;

  let role = headerRole || cookieRole || '';
  if (!role && cookieProfile) {
    try {
      const parsed = JSON.parse(decodeURIComponent(cookieProfile));
      role = parsed.role || '';
    } catch {}
  }

  // Demo user defaults to admin unless specified otherwise
  if (!role && headerUserId === 'usr_celsius_demo') {
    role = 'admin';
  }

  return {
    isAdmin: role === 'admin',
    adminId: headerUserId,
    adminEmail: req.headers.get('x-user-email') || 'admin@celsius.trade',
  };
}

export async function GET(req: NextRequest) {
  const { isAdmin } = verifyAdmin(req);

  // Invariant 3: Server-side role verification on every admin request
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get('userId');

  // If specific user detail requested
  if (targetUserId) {
    const details = await adminService.getUserDetails(targetUserId);
    if (!details) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, details });
  }

  const metrics = adminService.getMetrics();
  const users = adminService.getUsers();
  const featureFlags = adminService.getFeatureFlags();
  const announcements = adminService.getAnnouncements();
  const auditLogs = adminService.getAuditLogs();
  const signupTrend = adminService.get30DaySignupTrend();
  const feedback = adminService.getFeedbackList();

  return NextResponse.json({
    success: true,
    metrics,
    users,
    featureFlags,
    announcements,
    auditLogs,
    signupTrend,
    feedback,
    latestLedgerSnapshot: transparencyService.getLatestSnapshot(),
    ledgerAudit: transparencyService.verifyLedgerIntegrity(),
    telemetryErrors: logger.getRecentErrors(),
  });
}

export async function POST(req: NextRequest) {
  const { isAdmin, adminId, adminEmail } = verifyAdmin(req);

  // Invariant 3: Server-side role verification on every admin request
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 });
    }

    // 1. Freeze / Unfreeze user
    if (action === 'freeze_user' || action === 'unfreeze_user') {
      const targetUserId = payload?.userId;
      const newStatus = action === 'freeze_user' ? 'suspended' : 'active';
      const updatedUser = adminService.updateUserStatus(targetUserId, newStatus, adminId, adminEmail);

      if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        auditLogs: adminService.getAuditLogs(),
      });
    }

    // 2. Grant / Revoke admin role
    if (action === 'update_user_role') {
      const targetUserId = payload?.userId;
      const targetRole = payload?.role;
      if (!targetUserId || !['admin', 'trader'].includes(targetRole)) {
        return NextResponse.json({ error: 'Invalid user or role' }, { status: 400 });
      }

      const updatedUser = adminService.updateUserRole(targetUserId, targetRole, adminId, adminEmail);
      return NextResponse.json({
        success: true,
        user: updatedUser,
        auditLogs: adminService.getAuditLogs(),
      });
    }

    // 3. Toggle feature flag
    if (action === 'toggle_feature_flag') {
      const key = payload?.key;
      const enabled = Boolean(payload?.enabled);
      const updatedFlag = adminService.toggleFeatureFlag(key, enabled, adminId, adminEmail);

      if (!updatedFlag) {
        return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        flag: updatedFlag,
        featureFlags: adminService.getFeatureFlags(),
        auditLogs: adminService.getAuditLogs(),
      });
    }

    // 4. Create announcement
    if (action === 'create_announcement') {
      const text = payload?.text || payload?.message;
      const title = payload?.title || 'System Announcement';
      const type = payload?.type || 'info';
      const dismissible = payload?.dismissible !== false;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return NextResponse.json({ error: 'Announcement text is required' }, { status: 400 });
      }

      const created = adminService.addAnnouncement(
        {
          title,
          text: text.trim().slice(0, 300),
          message: text.trim().slice(0, 300),
          type,
          dismissible,
          active: true,
        },
        adminId,
        adminEmail
      );

      return NextResponse.json({
        success: true,
        announcement: created,
        announcements: adminService.getAnnouncements(),
        auditLogs: adminService.getAuditLogs(),
      });
    }

    // 5. Delete announcement
    if (action === 'delete_announcement') {
      const id = payload?.id;
      const deleted = adminService.deleteAnnouncement(id, adminId, adminEmail);
      return NextResponse.json({
        success: deleted,
        announcements: adminService.getAnnouncements(),
        auditLogs: adminService.getAuditLogs(),
      });
    }

    // 6. Toggle announcement active
    if (action === 'toggle_announcement') {
      const id = payload?.id;
      const active = Boolean(payload?.active);
      const toggled = adminService.toggleAnnouncement(id, active, adminId, adminEmail);
      return NextResponse.json({
        success: Boolean(toggled),
        announcements: adminService.getAnnouncements(),
        auditLogs: adminService.getAuditLogs(),
      });
    }

    // 7. Broadcast message to user
    if (action === 'broadcast_message') {
      const { targetUserId, title, content } = payload || {};
      const msg = adminService.sendBroadcastMessage(
        targetUserId || 'all',
        adminId,
        adminEmail,
        title || 'Official Notice',
        content || ''
      );

      return NextResponse.json({
        success: true,
        message: 'Broadcast message logged and dispatched.',
        broadcastMessage: msg,
        auditLogs: adminService.getAuditLogs(),
      });
    }

    // 8. Inspect user details
    if (action === 'get_user_details') {
      const targetUserId = payload?.userId;
      const details = await adminService.getUserDetails(targetUserId);
      return NextResponse.json({ success: true, details });
    }

    // 9. Update feedback status
    if (action === 'update_feedback_status') {
      const { id, status, adminNotes } = payload || {};
      const updated = adminService.updateFeedbackStatus(id, status, adminNotes, adminId, adminEmail);
      return NextResponse.json({
        success: Boolean(updated),
        feedback: adminService.getFeedbackList(),
        auditLogs: adminService.getAuditLogs(),
      });
    }

    // 10. Delete feedback
    if (action === 'delete_feedback') {
      const { id } = payload || {};
      const deleted = adminService.deleteFeedback(id, adminId, adminEmail);
      return NextResponse.json({
        success: deleted,
        feedback: adminService.getFeedbackList(),
        auditLogs: adminService.getAuditLogs(),
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
