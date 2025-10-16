import { useEffect, useState } from 'react';
import { getLayoutMetrics, getViewportTier } from './breakpoints';

export default function useViewportSize() {
  const getDims = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const tier = getViewportTier(width);
    const metrics = getLayoutMetrics(width);
    return { width, height, tier, metrics };
  };

  const [state, setState] = useState(getDims());

  useEffect(() => {
    let frame;
    const onResize = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setState(getDims()));
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return state;
}
