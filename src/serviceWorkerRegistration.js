// This optional code is used to register a service worker.
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// Store the registration for later use
let swRegistration = null;

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then((registration) => {
          swRegistration = registration;
          console.log('TRUTH PWA: Service worker ready (localhost)');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      swRegistration = registration;
      
      // Check for updates every 5 minutes
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log('TRUTH PWA: New version available!');
              
              // Show update notification
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              } else {
                // Default: show a simple notification
                showUpdateNotification(registration);
              }
            } else {
              console.log('TRUTH PWA: Content cached for offline use.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('TRUTH PWA: Registration failed:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (response.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('TRUTH PWA: No internet connection. Running in offline mode.');
    });
}

// Show update notification
function showUpdateNotification(registration) {
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'pwa-update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #1a1a23 0%, #09090d 100%);
      color: #ffffff;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      border: 2px solid #ff6b6b;
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideUp 0.3s ease-out;
    ">
      <span style="font-size: 24px;">🔄</span>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">Update Available</div>
        <div style="font-size: 14px; color: #999;">A new version of TRUTH is ready</div>
      </div>
      <button id="pwa-update-btn" style="
        background: #ff6b6b;
        color: #09090d;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        margin-left: 8px;
        transition: all 0.2s;
      ">Update Now</button>
      <button id="pwa-dismiss-btn" style="
        background: transparent;
        color: #999;
        border: none;
        padding: 8px;
        cursor: pointer;
        font-size: 18px;
      ">✕</button>
    </div>
    <style>
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      #pwa-update-btn:hover { background: #ffffff; }
    </style>
  `;
  
  document.body.appendChild(notification);
  
  // Handle update button
  document.getElementById('pwa-update-btn').addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    notification.remove();
    window.location.reload();
  });
  
  // Handle dismiss button
  document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
    notification.remove();
  });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Export for manual update trigger
export function checkForUpdates() {
  if (swRegistration) {
    swRegistration.update();
  }
}
