import { useRef, useEffect } from 'react';

/**
 * Custom hook for detecting swipe gestures
 * @param {Function} callback - Function to call on swipe (receives direction: 'left' or 'right')
 * @param {number} threshold - Minimum distance (in pixels) to register as a swipe (default: 50)
 * @returns {Object} ref to attach to element
 */
export const useSwipe = (callback, threshold = 50) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchStartY.current = e.changedTouches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    // Calculate distances
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Check if movement is more horizontal than vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > threshold) {
        const direction = diffX > 0 ? 'left' : 'right';
        callback(direction);
      }
    }
  };

  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, false);
    element.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [callback, threshold]);

  return ref;
};
