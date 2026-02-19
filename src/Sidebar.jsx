/* Sidebar for admin dashboard*/
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarRef = useRef(null);

  // Swipe gesture handler for mobile sidebar
  const handleSwipe = useCallback((direction) => {
    if (direction === "right") {
      setSidebarVisible(true);
    } else if (direction === "left") {
      setSidebarVisible(false);
    }
  }, []);

  // Set up touch listeners for swipe on mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Only register as horizontal swipe if movement is more horizontal than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const direction = diffX > 0 ? 'left' : 'right';
        handleSwipe(direction);
      }
    };

    // Add listeners to the document for swipe detection
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleSwipe]);

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarVisible ? 'visible' : ''}`}
        onClick={() => setSidebarVisible(false)}
      />

      <div ref={sidebarRef} className={`sidebar ${sidebarVisible ? 'visible' : ''}`}>
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul className="sidebar-nav">
        <li><Link to="/admin-dashboard">Dashboard</Link></li>
        <li><Link to="/admin-user-management">User Management</Link></li>
        <li><Link to="/admin-tutorials">Tutorials</Link></li>
        <li><Link to="/admin-reviews">Reviews</Link></li>
        <li><Link to="/admin-analytics">Analytics</Link></li>
      </ul>

      <style>{`
        .sidebar {
          width: 230px;
          background: var(--sidebar-color);
          color: var(--text-color);
          height: 100vh;
          position: fixed;
          padding: 1rem;
          transition: background-color 0.3s ease, color 0.3s ease;
          z-index: 900;
          top: 0;
          left: 0;
        }

        /* Mobile responsive styles */
        @media (max-width: 576px) {
          .sidebar {
            width: 80vw;
            max-width: 320px;
            height: 100vh;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                        background-color 0.3s ease, 
                        color 0.3s ease;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
          }

          .sidebar.visible {
            transform: translateX(0);
          }

          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 800;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }

          .sidebar-overlay.visible {
            opacity: 1;
            pointer-events: auto;
          }
        }

        .sidebar-title {
          font-size: 1.4rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: var(--text-color);
        }
        .sidebar-nav {
          list-style: none;
          padding: 0;
        }
        .sidebar-nav li {
          margin: 0.8rem 0;
        }
        .sidebar-nav a {
          color: var(--text-color);
          text-decoration: none;
          transition: 0.2s;
          display: block;
          padding: 8px 8px;
          border-radius: 4px;
        }
        .sidebar-nav a:hover {
          background-color: var(--accent-color);
          color: var(--white-color);
        }
      `}</style>
      </div>
    </>
  );
}
