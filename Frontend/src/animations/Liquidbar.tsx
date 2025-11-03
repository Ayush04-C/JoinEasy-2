import React, { useState, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

interface LiquidProgressBarProps {
  progress: number; // 0–100
  height?: number;
  color?: string;
}

const LiquidProgressBar: React.FC<LiquidProgressBarProps> = ({
  progress,
  height = 25,
  color = "#6366F1", // Indigo
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const motionProgress = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionProgress, progress, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayProgress(Math.round(latest));
      }
    });

    return controls.stop;
  }, [progress, motionProgress]);

  return (
    <div
      className="relative w-full rounded-full overflow-hidden bg-gray-800 shadow-inner"
      style={{ height }}
    >

      <motion.div
        className="absolute top-0 left-0 h-full"
        style={{
          background: `linear-gradient(90deg, ${color} 0%, #4338CA 50%, ${color} 100%)`,
          backgroundSize: "200% 100%",
        }}
        initial={{ width: "0%" }}
        animate={{ 
          width: `${progress}%`,
          backgroundPosition: ["0% 0%", "200% 0%"],
        }}
        transition={{
          width: {
            duration: 1.5,
            ease: "easeOut",
          },
          backgroundPosition: {
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }
        }}
      />

      <motion.div
        className="absolute top-0 left-0 h-full opacity-50"
        style={{
          background: `url("data:image/svg+xml,%3Csvg width='100' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q 25 10, 50 20 T 100 20 V40 H0 Z' fill='%23ffffff33'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "100px 40px",
        }}
        initial={{ width: "0%" }}
        animate={{ 
          width: `${progress}%`,
          backgroundPositionX: ["0px", "100px"],
        }}
        transition={{
          width: {
            duration: 1.5,
            ease: "easeOut",
          },
          backgroundPositionX: {
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-white font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {displayProgress}%
        </motion.span>
      </div>
    </div>
  );
};

export default LiquidProgressBar;
