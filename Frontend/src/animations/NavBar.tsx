import { motion } from "framer-motion";
import { useState } from "react";

const navItems = ["Home", "Courses", "Dashboard", "Profile"];

export default function GlassNavbar() {
  const [active, setActive] = useState("Home");

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] md:w-[70%] rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex justify-between items-center px-8 py-3 shadow-lg"
    >
      <h1 className="text-xl font-bold text-white">LearnSphere</h1>

      <ul className="flex gap-6 text-white font-medium">
        {navItems.map((item) => (
          <motion.li
            key={item}
            whileHover={{ scale: 1.1, color: "#60a5fa" }}
            className={`cursor-pointer ${
              active === item ? "text-blue-400" : "text-white"
            }`}
            onClick={() => setActive(item)}
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
}
