import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface ScrollFadeInProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  delay?: number;
  distance?: number;
  threshold?: number;
  blur?: boolean;
  className?: string;
  once?: boolean; // Trigger animation only once
}

const ScrollFadeIn: React.FC<ScrollFadeInProps> = ({
  children,
  direction = 'up',
  duration = 800,
  delay = 0,
  distance = 30,
  threshold = 0.1,
  blur = false,
  className = '',
  once = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { 
        threshold: threshold,
        rootMargin: '0px 0px -50px 0px' // Trigger animation 50px before element enters viewport
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, delay, once]);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    
    switch (direction) {
      case 'up':
        return `translate(0, ${distance}px)`;
      case 'down':
        return `translate(0, -${distance}px)`;
      case 'left':
        return `translate(${distance}px, 0)`;
      case 'right':
        return `translate(-${distance}px, 0)`;
      case 'none':
      default:
        return 'translate(0, 0)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        filter: blur ? (isVisible ? 'blur(0px)' : 'blur(8px)') : 'none',
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out, filter ${duration}ms ease-out`,
        willChange: 'opacity, transform, filter'
      }}
    >
      {children}
    </div>
  );
};

export default ScrollFadeIn;
