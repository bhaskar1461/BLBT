import { NextResponse } from 'next/server';
import { adminService } from '@/lib/adminService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const flags = adminService.getFeatureFlags();
  const announcements = adminService.getAnnouncements().filter((a) => a.active);

  const flagMap: Record<string, boolean> = {};
  for (const f of flags) {
    flagMap[f.key] = f.enabled;
  }

  return NextResponse.json({
    flags: flagMap,
    flagRecords: flags,
    announcements,
  });
}
