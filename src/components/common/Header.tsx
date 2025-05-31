import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center mb-8"
    >
      <h1
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#6B7280] to-[#1A1F2A] bg-clip-text"
        style={{
          WebkitTextFillColor: theme === "dark" ? "#6B7280" : "#2E424D",
          color: theme === "dark" ? "#6B7280" : "#2E424D",
        }}
      >
        Kryptonite Wallet
      </h1>
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full border-2 shadow-lg ${
          theme === "dark"
            ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
            : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
        }`}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </motion.div>
  );
};

export default Header;
