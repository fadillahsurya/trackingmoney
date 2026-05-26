export function checkBudgetStatus(): "not_configured" {
  return "not_configured";
}

export function shouldSendDailyAlert(): boolean {
  return false;
}

export function shouldSendMonthlyAlert(): boolean {
  return false;
}

export async function sendWebhookNotification(): Promise<void> {
  // Placeholder untuk tahap notifikasi/webhook berikutnya.
}
