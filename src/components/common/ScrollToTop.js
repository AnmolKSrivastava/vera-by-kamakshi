import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Force scroll to top using multiple methods for maximum compatibility
    const scrollToTop = () => {
      // Method 1: Standard scrollTo
      window.scrollTo(0, 0);
      
      // Method 2: Document element scroll
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      
      // Method 3: Body scroll
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // Execute immediately
    scrollToTop();

    // Also execute after a frame to handle lazy-loaded content
    requestAnimationFrame(() => {
      scrollToTop();
    });

    // Execute after a small delay to handle async content
    const timeoutId = setTimeout(() => {
      scrollToTop();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search, location.key]); // Watch key for same-path navigation

  return null;
}

export default ScrollToTop;
