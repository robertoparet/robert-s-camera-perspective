import { useEffect, useState, RefObject } from 'react';

interface ResizeObserverEntry {
  contentRect: DOMRectReadOnly;
  target: Element;
}

export interface UseResizeObserverResult {
  width: number;
  height: number;
}

export function useResizeObserver<T extends Element>(
  ref: RefObject<T>
): UseResizeObserverResult {
  const [size, setSize] = useState<UseResizeObserverResult>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
}
