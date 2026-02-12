import { useState, useEffect } from 'react';

/**
 * Custom hook to handle PWA install prompt
 * @returns {Object} { canInstall, isInstalled, promptInstall }
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e);
      setCanInstall(true);
      console.log('TRUTH PWA: Install prompt available');
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      console.log('TRUTH PWA: App installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log('TRUTH PWA: No install prompt available');
      return false;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`TRUTH PWA: User response - ${outcome}`);

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setCanInstall(false);

    return outcome === 'accepted';
  };

  return { canInstall, isInstalled, promptInstall };
}

export default useInstallPrompt;
