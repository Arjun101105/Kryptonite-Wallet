import { useTheme } from "../../contexts/ThemeContext";
import { useWallet } from "../../contexts/WalletContext";

const WalletActions = () => {
  const { theme } = useTheme();
  const { 
    mnemonic, 
    handleAddSolanaWallet, 
    handleAddEthWallet 
  } = useWallet();

  // Only show this component if a seed phrase has been generated/imported
  if (mnemonic[0] === " ") return null;

  return (
    <div className="flex gap-4 mb-8">
      <button
        className={`px-6 py-3 border-2 shadow-md ${
          theme === "dark"
            ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
            : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
        } rounded-lg transition-all duration-300`}
        onClick={handleAddSolanaWallet}
      >
        Add Solana Wallet
      </button>
      <button
        className={`px-6 py-3 border-2 shadow-md ${
          theme === "dark"
            ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
            : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
        } rounded-lg transition-all duration-300`}
        onClick={handleAddEthWallet}
      >
        Add Ethereum Wallet
      </button>
    </div>
  );
};

export default WalletActions;
