"use client";
import { useState, useEffect, useMemo } from "react";

interface Icon {
  id: number;
  svg: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
  depth: number;
}

export default function InteractiveBg() {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const iconCount = 30;

  const iconSvgs = useMemo(
    () => [
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
        viewBox="0 0 24 24" fill="none" stroke="currentColor" 
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
        viewBox="0 0 24 24" fill="none" stroke="currentColor" 
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
        viewBox="0 0 24 24" fill="none" stroke="currentColor" 
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 
        2 6.477 2 12s4.477 10 10 10z"/>
        <path d="m16.5 8.5-6.2 6.2-2.8-2.8"/></svg>`,
    ],
    []
  );

  const generateIcons = () => {
    const generatedIcons = [];
    for (let i = 0; i < iconCount; i++) {
      generatedIcons.push({
        id: i,
        svg: iconSvgs[Math.floor(Math.random() * iconSvgs.length)],
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 50 + 20,
        opacity: 0.1,
        animationDuration: Math.random() * 5 + 5,
        animationDelay: Math.random() * 5,
        depth: Math.random() * 0.4 + 0.1,
      });
    }
    setIcons(generatedIcons);
  };

  useEffect(() => {
    generateIcons();
    window.addEventListener("resize", generateIcons);
    return () => window.removeEventListener("resize", generateIcons);
  }, [iconSvgs]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        #dynamic-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw; 
          height: 100vh; 
          background: linear-gradient(135deg, #110124ff 0%, #060116ff 100%);
          overflow: hidden;
          z-index: -1;
        }

        .icon-wrapper {
          position: absolute;
          will-change: transform;
          transition: transform 0.1s linear;
        }

        .icon-container {
          animation: float 6s ease-in-out infinite;
        }

        .icon-container svg {
          display: block;
          stroke: rgba(255, 255, 255, 0.8);
          stroke-width: 1.5px;
          fill: none;
          filter: drop-shadow(0 0 5px rgba(255,255,255,0.2));
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <div id="dynamic-bg">
        {icons.map((icon) => (
          <Icon key={icon.id} {...icon} mousePosition={mousePosition} />
        ))}
      </div>
    </>
  );
}

function Icon({
  svg,
  x,
  y,
  size,
  opacity,
  animationDuration,
  animationDelay,
  depth,
  mousePosition,
}: {
  svg: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
  depth: number;
  mousePosition: { x: number; y: number };
}) {
  const moveX = useMemo(() => {
    const centerX = window.innerWidth / 2;
    return -((mousePosition.x - centerX) * depth) / 10;
  }, [mousePosition.x, depth]);

  const moveY = useMemo(() => {
    const centerY = window.innerHeight / 2;
    return -((mousePosition.y - centerY) * depth) / 10;
  }, [mousePosition.y, depth]);

  const wrapperStyle = {
    left: `${x}px`,
    top: `${y}px`,
    opacity: opacity,
    transform: `translate3d(${moveX}px, ${moveY}px, 0)`,
  };

  const containerStyle = {
    animationDuration: `${animationDuration}s`,
    animationDelay: `-${animationDelay}s`,
  };

  return (
    <div className="icon-wrapper" style={wrapperStyle}>
      <div
        className="icon-container"
        style={containerStyle}
        dangerouslySetInnerHTML={{ __html: svg }}
        ref={(el) => {
          if (el && el.firstChild) {
            const child = el.firstChild as HTMLElement;
            child.style.width = `${size}px`;
            child.style.height = `${size}px`;
          }
        }}
      />
    </div>
  );
}
