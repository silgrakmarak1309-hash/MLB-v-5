export interface AppToast {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'payout' | string;
  duration?: number;
  timestamp?: number;
}

export function dispatchAppToast(toast: Omit<AppToast, 'id' | 'timestamp'> & { id?: string; duration?: number }): void {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('mlb_app_toast', {
    detail: {
      id: toast.id || Math.random().toString(36).substring(2, 9),
      title: toast.title,
      message: toast.message,
      type: toast.type || 'info',
      duration: toast.duration,
      timestamp: Date.now(),
    },
  });
  window.dispatchEvent(event);
}

export function showDevicePushAlert(title: string, body: string, options?: any): void {
  if (typeof window === 'undefined') return;
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico', ...options });
      return;
    }
  } catch (_) {}
  dispatchAppToast({ title, message: body, type: 'info' });
}

export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (_) {}
}

export function sendPushNotification(title: string, message: string): void {
  dispatchAppToast({ title, message, type: 'info' });
}

export async function sendOrderAlertToPartner(
  partnerIdOrName?: string,
  roleOrOrderId?: string,
  orderNumberOrAmount?: string | number,
  details?: any
): Promise<void> {
  const displayMsg = typeof orderNumberOrAmount === 'number'
    ? `Order #${String(roleOrOrderId || '').slice(-6)} placed with value ₹${orderNumberOrAmount}. Notifying ${partnerIdOrName || 'partner'}...`
    : `Order #${orderNumberOrAmount || 'MLB'} received! Check your dashboard for details.`;

  dispatchAppToast({
    title: 'Order Alert',
    message: displayMsg,
    type: 'success',
  });
}

export function recordAppNotification(
  userId: string,
  title: string,
  message: string,
  type: string = 'info',
  metadata?: any
): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const key = `mlb_notifications_${userId}`;
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      metadata,
      read: false,
      created_at: new Date().toISOString(),
    };
    const updated = [newNotification, ...list].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:notifications_updated'));
  } catch (_) {}
}

export async function checkAndSend3DaysPlanExpiryAlerts(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const rawUser = localStorage.getItem('mlb_active_user');
    if (!rawUser) return;
    const user = JSON.parse(rawUser);
    if (!user?.plan_expiry_date) return;

    const expiryTime = new Date(user.plan_expiry_date).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays <= 3) {
      const alertedKey = `mlb_expiry_alerted_${user.id}_${user.plan_expiry_date}`;
      if (!localStorage.getItem(alertedKey)) {
        dispatchAppToast({
          title: 'PRO Plan Expiring Soon',
          message: `Your PRO plan expires in ${diffDays} day(s). Renew now to keep your verified badge!`,
          type: 'warning',
        });
        recordAppNotification(
          user.id,
          'PRO Plan Expiring Soon',
          `Your PRO plan expires in ${diffDays} day(s). Renew now to keep your verified badge!`,
          'warning'
        );
        localStorage.setItem(alertedKey, 'true');
      }
    }
  } catch (_) {}
}
