import { db } from '../db';
import type { ActivityLog } from '../types';

export async function logActivity(type: ActivityLog['type'], message: string): Promise<void> {
  try {
    await db.activityLogs.add({
      type,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function getRecentActivity(limit: number = 50): Promise<ActivityLog[]> {
  try {
    return await db.activityLogs
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return [];
  }
}

export async function clearOldActivityLogs(daysToKeep: number = 30): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    await db.activityLogs
      .where('timestamp')
      .below(cutoffDate.toISOString())
      .delete();
  } catch (error) {
    console.error('Failed to clear old activity logs:', error);
  }
}
