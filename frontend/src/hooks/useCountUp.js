import { useEffect, useRef, useState } from "react";

export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = 0;
    startRef.current = null;
    let frameId;

    function step(timestamp) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (progress < 1) frameId = requestAnimationFrame(step);
    }

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return value;
}
