import { useEffect, useRef } from 'react';

export function useScrollbarDetection() {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const checkScrollbar = () => {
      const hasScrollbar = element.scrollHeight > element.clientHeight || 
                          element.scrollWidth > element.clientWidth;
      
      element.setAttribute('data-scrollable', hasScrollbar ? 'true' : 'false');
    };

    // Initial check
    checkScrollbar();

    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollbar);
    resizeObserver.observe(element);

    // Check on content changes
    const mutationObserver = new MutationObserver(checkScrollbar);
    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return elementRef;
}
