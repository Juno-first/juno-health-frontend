import { useState, useRef, useCallback, useEffect } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  initialPosition?: Partial<Position>;
  holdDelay?: number; // ms before drag starts
}

export function useDraggable(options?: UseDraggableOptions) {
  const holdDelay = options?.holdDelay ?? 180;

  const [position, setPosition] = useState<Position>({
    x: options?.initialPosition?.x ?? 0,
    y: options?.initialPosition?.y ?? 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const posStart = useRef<Position>({ x: 0, y: 0 });
  const posRef = useRef<Position>(position);
  const wasDraggedRef = useRef(false);
  const dragArmedRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  posRef.current = position;

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const stopAll = useCallback(() => {
    clearHoldTimer();
    setIsDragging(false);
    dragArmedRef.current = false;

    cleanupRef.current?.();
    cleanupRef.current = null;

    window.setTimeout(() => {
      wasDraggedRef.current = false;
    }, 0);
  }, []);

  const armDrag = useCallback((clientX: number, clientY: number) => {
    dragStart.current = { x: clientX, y: clientY };
    posStart.current = { ...posRef.current };
    wasDraggedRef.current = false;
    dragArmedRef.current = false;

    clearHoldTimer();
    holdTimerRef.current = window.setTimeout(() => {
      dragArmedRef.current = true;
      setIsDragging(true);
    }, holdDelay);
  }, [holdDelay]);

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragArmedRef.current) return;

    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      wasDraggedRef.current = true;
    }

    setPosition({
      x: posStart.current.x + dx,
      y: posStart.current.y + dy,
    });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    armDrag(e.clientX, e.clientY);

    const onMouseMove = (ev: MouseEvent) => {
      updateDrag(ev.clientX, ev.clientY);
    };

    const onMouseUp = () => {
      stopAll();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    cleanupRef.current = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [armDrag, updateDrag, stopAll]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    if (!touch) return;

    armDrag(touch.clientX, touch.clientY);

    const onTouchMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const t = ev.touches[0];
      if (!t) return;
      updateDrag(t.clientX, t.clientY);
    };

    const onTouchEnd = () => {
      stopAll();
    };

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    cleanupRef.current = () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [armDrag, updateDrag, stopAll]);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  return {
    position,
    isDragging,
    wasDraggedRef,
    bind: {
      onMouseDown,
      onTouchStart,
    },
  };
}