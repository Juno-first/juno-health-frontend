import { useState, useRef, useCallback } from "react";

interface Position { x: number; y: number }

export function useDraggable(initialPosition?: Partial<Position>) {
  const [position, setPosition] = useState<Position>({
    x: initialPosition?.x ?? 0,
    y: initialPosition?.y ?? 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart  = useRef<Position>({ x: 0, y: 0 });
  const posStart   = useRef<Position>({ x: 0, y: 0 });
  const posRef     = useRef<Position>(position); // keep a sync ref to latest position
  const elementRef = useRef<HTMLDivElement>(null);

  // Keep posRef in sync so onMouseDown always reads the latest position
  posRef.current = position;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current  = { ...posRef.current };
    setIsDragging(true);

    const onMouseMove = (ev: MouseEvent) => {
      setPosition({
        x: posStart.current.x + (ev.clientX - dragStart.current.x),
        y: posStart.current.y + (ev.clientY - dragStart.current.y),
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    posStart.current  = { ...posRef.current };
    setIsDragging(true);

    const onTouchMove = (ev: TouchEvent) => {
      const t = ev.touches[0];
      setPosition({
        x: posStart.current.x + (t.clientX - dragStart.current.x),
        y: posStart.current.y + (t.clientY - dragStart.current.y),
      });
    };

    const onTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
    };

    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend",  onTouchEnd);
  }, []);

  return { position, isDragging, onMouseDown, onTouchStart, elementRef };
}