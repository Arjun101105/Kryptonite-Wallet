import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { useWallet } from "../../contexts/WalletContext";

const BlockchainSelector = () => {
  const { theme } = useTheme();
  const { blockchain, setBlockchain } = useWallet();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <h2 className="text-2xl md:text-3xl font-semibold mb-2">Choose Your Blockchain</h2>
      <p className={` ${theme === "dark" ? "text-[#6B7280]" : "text-[#2E424D]"} mb-4`}>
        Kryptonite supports multiple blockchains for secure wallet management.
      </p>
      <div className="flex gap-4">
        <button
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 shadow-lg ${
            blockchain === "solana"
              ? theme === "dark"
                ? "bg-[#E6E8EB] text-[#1A1F2A] border-[#A1A5B0]"
                : "bg-[#5B8291] text-[#FFFFFF] border-[#C0C0C0]"
              : theme === "dark"
              ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
              : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
          }`}
          onClick={() => setBlockchain("solana")}
          disabled={blockchain === "ethereum"}
          title={blockchain === "ethereum" ? "Ethereum already selected" : ""}
        >
          Solana
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 shadow-lg ${
            blockchain === "ethereum"
              ? theme === "dark"
                ? "bg-[#E6E8EB] text-[#1A1F2A] border-[#A1A5B0]"
                : "bg-[#5B8291] text-[#FFFFFF] border-[#C0C0C0]"
              : theme === "dark"
              ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
              : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
          }`}
          onClick={() => setBlockchain("ethereum")}
          disabled={blockchain === "solana"}
          title={blockchain === "solana" ? "Solana already selected" : ""}
        >
          Ethereum
        </button>
      </div>
    </motion.div>
  );
};

export default BlockchainSelector;
