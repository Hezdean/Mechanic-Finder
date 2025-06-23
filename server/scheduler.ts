import { scheduleReminders } from './notifications';

// Simple scheduler for sending reminders
// In production, use a proper job scheduler like node-cron or agenda

let reminderInterval: NodeJS.Timeout | null = null;

export function startReminderScheduler(): void {
  // Check for reminders every hour
  reminderInterval = setInterval(async () => {
    try {
      await scheduleReminders();
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  }, 60 * 60 * 1000); // 1 hour in milliseconds

  console.log('Reminder scheduler started - checking every hour');
}

export function stopReminderScheduler(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
    console.log('Reminder scheduler stopped');
  }
}

// For immediate testing, you can call this function
export async function testReminder(): Promise<void> {
  console.log('Testing reminder system...');
  await scheduleReminders();
}

// Manual trigger for appointment reminders (useful for testing)
export async function triggerRemindersNow(): Promise<{ success: boolean; message: string }> {
  try {
    await scheduleReminders();
    return { success: true, message: 'Reminders processed successfully' };
  } catch (error) {
    console.error('Error triggering reminders:', error);
    return { success: false, message: 'Failed to process reminders' };
  }
}