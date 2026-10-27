import React, { useEffect, useRef, useState } from 'react';

export type ScrollRevealVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'flip-up'
  | 'royal-bloom';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: ScrollRevealVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  shimmer?: boolean;
  disabled?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 850,
  threshold = 0.14,
  once = false,
  className = '',
  shimmer = false,
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            // Reset smoothly when scrolled well out of view so scrolling down again replays the effect
            if (entry.boundingClientRect.top > window.innerHeight * 0.92) {
              setIsVisible(false);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -6% 0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once, disabled]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
      className={`scroll-reveal-item scroll-reveal-${variant} ${
        isVisible ? 'scroll-reveal-visible' : 'scroll-reveal-hidden'
      } ${shimmer && isVisible ? 'scroll-reveal-shimmer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
