export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showLocalNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      ...options
    });
  }
};

export const registerPushSubscription = async () => {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) return subscription;

    // In production, this would use a VAPID key from the server
    // const newSubscription = await registration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: VAPID_PUBLIC_KEY
    // });
    // return newSubscription;
    return null;
  } catch (err) {
    console.error('Push subscription error:', err);
    return null;
  }
};
