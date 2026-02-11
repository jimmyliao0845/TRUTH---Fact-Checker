import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * Banner component that shows when the user is offline
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '56px', // Below navbar
        left: 0,
        right: 0,
        backgroundColor: 'var(--error-color)',
        color: 'var(--primary-color)',
        padding: '12px 20px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '14px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <span style={{ fontSize: '18px' }}>📡</span>
      <span>You're offline. Some features may be unavailable.</span>
      <style>
        {`
          @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

export default OfflineBanner;
