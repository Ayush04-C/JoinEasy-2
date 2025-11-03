import { useState } from "react";
import confetti from "canvas-confetti";

export default function ConfettiButton() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
    setTimeout(() => setClicked(false), 1000);
  };

  return (
    <button
      onClick={handleClick}
      className="w-40"
    >
      {clicked ? "🎉 Great Job!" : "Confirm"}
    </button>
  );
}
