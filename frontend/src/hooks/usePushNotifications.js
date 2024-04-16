import { useEffect } from 'react';
import { useHandleSubscribeMutation } from '../slices/pushNotificationApiSlice';

const usePushNotifications = () => {
  const [handleSubscribe] = useHandleSubscribeMutation();

  useEffect(() => {
    const handlePermission = async () => {
      if (!('Notification' in window)) {
        return false;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return false;
      }

      return true;
    };

    const handleSubscription = async () => {
      try {
        let swUrl = `${process.env.PUBLIC_URL}/sw.js`;
        const serviceWorkerRegistration = await navigator.serviceWorker
          .register(swUrl)
          .catch((err) => console.error(err));
       // console.log('Service Worker registered:', serviceWorkerRegistration);

        const subscription =
          await serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              'BG0BzgeISwE7My_Sue8MTDdtSYdEPCemUYpmbbmcSFtquayfifnmzx-OlsUBwh6cvOuBh62xYFbXUdgLyVoUQvA',
          });

        // Send the subscription details to your backend
        handleSubscribe({ subscription });
       // console.log('Subscription successful:', subscription);
      } catch (error) {
       // console.error('Error subscribing to push notifications:', error);
      }
    };

    // Check permission and handle subscription
    const initializePushNotifications = async () => {
      const isPermissionGranted = await handlePermission();
      if (isPermissionGranted) {
        handleSubscription();
      }
    };

    // Automatically initialize push notifications when the hook is called
    initializePushNotifications();

    return () => {};
  }, [handleSubscribe]);

  return null; // Return null since we don't need to render anything
};

export default usePushNotifications;
