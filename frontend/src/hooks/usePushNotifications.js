import { useEffect } from 'react';
import { useHandleSubscribeMutation } from '../slices/pushNotificationApiSlice';

const usePushNotifications = () => {
  const [handleSubscribe] = useHandleSubscribeMutation();

  function urlBase64ToUint8Array(base64String) {
    // Step 1: Add padding to make the length of the base64 string a multiple of 4
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);

    // Step 2: Replace URL-safe characters with base64 standard characters
    const base64 = (base64String + padding)
      .replace(/-/g, '+') // Replace '-' with '+'
      .replace(/_/g, '/'); // Replace '_' with '/'

    // Step 3: Decode the base64 string to raw binary data
    const rawData = window.atob(base64);

    // Step 4: Create a Uint8Array from the raw binary data
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    // Return the Uint8Array containing the binary data
    return outputArray;
  }

  useEffect(() => {
    const handlePermission = async () => {
      if (!('Notification' in window)) {

        return false;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Permission for notifications denied');
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
        const vapidPubliKey =
          'BG0BzgeISwE7My_Sue8MTDdtSYdEPCemUYpmbbmcSFtquayfifnmzx-OlsUBwh6cvOuBh62xYFbXUdgLyVoUQvA';
        const convertedVapidKey = urlBase64ToUint8Array(vapidPubliKey);

        const subscription =
          await serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
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
