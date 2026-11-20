'use client';

import React, { useEffect, useState } from 'react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  zIndex?: string;
}

export default function ModalWrapper({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-xl',
  zIndex = 'z-[9999]',
}: ModalWrapperProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setShouldRender(true);
      // Double rAF ensures the initial state is painted before animating in
      const frame1 = requestAnimationFrame(() => {
        const frame2 = requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      return () => {
        cancelAnimationFrame(frame1);
      };
    } else {
      setIsAnimating(false);
      timer = setTimeout(() => {
        setShouldRender(false);
      }, 260); // Durasi transisi keluar
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center p-3 sm:p-4 overflow-y-auto transition-all duration-250 ${
        isAnimating
          ? 'bg-slate-900/60 backdrop-blur-sm opacity-100 pointer-events-auto'
          : 'bg-slate-900/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 transition-all duration-250 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-3'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
