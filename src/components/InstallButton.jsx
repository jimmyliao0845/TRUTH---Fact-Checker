import React, { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { FaDownload, FaMobileAlt, FaCheckCircle } from 'react-icons/fa';

/**
 * Install App Button Component
 * Shows a button to install the PWA when available
 */
export function InstallButton({ variant = 'default', className = '' }) {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    await promptInstall();
    setIsInstalling(false);
  };

  // Already installed
  if (isInstalled) {
    return (
      <div 
        className={`d-flex align-items-center gap-2 ${className}`}
        style={{
          color: '#198754',
          fontSize: '0.9rem',
          padding: '10px 20px',
          backgroundColor: 'rgba(25, 135, 84, 0.1)',
          borderRadius: '50px',
          border: '2px solid #198754'
        }}
      >
        <FaCheckCircle />
        <span>App Installed</span>
      </div>
    );
  }

  // Can't install (not available or already in standalone mode)
  if (!canInstall) {
    return null;
  }

  // Large button variant (for hero sections)
  if (variant === 'large') {
    return (
      <button
        onClick={handleInstall}
        disabled={isInstalling}
        className={`btn btn-lg px-4 py-3 rounded-pill d-flex align-items-center gap-2 ${className}`}
        style={{
          backgroundColor: 'transparent',
          color: 'var(--accent-color)',
          border: '2px solid var(--accent-color)',
          fontWeight: '600',
          fontSize: '1rem',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-color)';
          e.currentTarget.style.color = 'var(--primary-color)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--accent-color)';
        }}
      >
        {isInstalling ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status"></span>
            Installing...
          </>
        ) : (
          <>
            <FaDownload />
            Install App
          </>
        )}
      </button>
    );
  }

  // Compact variant (for navbars)
  if (variant === 'compact') {
    return (
      <button
        onClick={handleInstall}
        disabled={isInstalling}
        className={`btn btn-sm d-flex align-items-center gap-1 ${className}`}
        style={{
          backgroundColor: 'var(--accent-color)',
          color: 'var(--primary-color)',
          border: 'none',
          borderRadius: '8px',
          padding: '6px 12px',
          fontWeight: '600',
          fontSize: '0.85rem'
        }}
      >
        <FaDownload size={14} />
        {!isInstalling && <span>Install</span>}
      </button>
    );
  }

  // Default button
  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className={`btn d-flex align-items-center gap-2 ${className}`}
      style={{
        backgroundColor: 'var(--accent-color)',
        color: 'var(--primary-color)',
        border: '2px solid var(--accent-color)',
        borderRadius: '50px',
        padding: '12px 24px',
        fontWeight: '600',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--primary-color)';
        e.currentTarget.style.color = 'var(--accent-color)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--accent-color)';
        e.currentTarget.style.color = 'var(--primary-color)';
      }}
    >
      {isInstalling ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status"></span>
          Installing...
        </>
      ) : (
        <>
          <FaMobileAlt />
          Install TRUTH App
        </>
      )}
    </button>
  );
}

/**
 * iOS Install Instructions Component
 * Shows instructions for iOS users (Safari doesn't support beforeinstallprompt)
 */
export function IOSInstallInstructions({ show, onClose }) {
  if (!show) return null;

  // Detect if on iOS and not in standalone mode
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  if (!isIOS || isStandalone) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1a1a23',
        color: '#ffffff',
        padding: '20px 24px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '2px solid #ff6b6b',
        zIndex: 10000,
        maxWidth: '350px',
        textAlign: 'center',
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'transparent',
          border: 'none',
          color: '#666',
          fontSize: '18px',
          cursor: 'pointer'
        }}
      >
        ✕
      </button>
      
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>📲</div>
      <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Install TRUTH</h4>
      <p style={{ fontSize: '14px', color: '#999', marginBottom: '16px' }}>
        To install this app on your iPhone/iPad:
      </p>
      <ol style={{ textAlign: 'left', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
        <li style={{ marginBottom: '8px' }}>
          Tap the <strong>Share</strong> button <span style={{ fontSize: '18px' }}>⬆️</span>
        </li>
        <li style={{ marginBottom: '8px' }}>
          Scroll down and tap <strong>"Add to Home Screen"</strong>
        </li>
        <li>
          Tap <strong>"Add"</strong> to install
        </li>
      </ol>
      
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateX(-50%) translateY(100px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default InstallButton;
