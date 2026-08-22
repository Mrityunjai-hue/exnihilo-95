/**
 * useDraggable.ts — Reusable Window Dragging Hook for Windows 95
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

export function useDraggable(initialPosition: Position = { x: 80, y: 50 }) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: initialPosition.x,
    startY: initialPosition.y,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag with left click and ignore clicks on buttons or controls
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };

    e.preventDefault();
  }, [position]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(0, Math.min(window.innerWidth - 100, dragStartRef.current.startX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, dragStartRef.current.startY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return {
    position,
    setPosition,
    handleMouseDown,
  };
}
