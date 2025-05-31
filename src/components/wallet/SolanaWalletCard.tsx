import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { useTheme } from "../../contexts/ThemeContext";
import { useWallet } from "../../contexts/WalletContext";
import { SolanaWallet } from "../../types/wallet";

interface WalletCardProps {
  wallet: SolanaWallet;
  index: number;
}

const SolanaWalletCard = ({ wallet, index }: WalletCardProps) => {
  const { theme } = useTheme();
  const {
    expandedWallet,
    copyAddress,
    confirmDeleteWallet,
    toggleWalletExpansion,
  } = useWallet();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 border-4 ${
        theme === "dark"
          ? "bg-[#2C323F] text-[#E6E8EB] border-[#A1A5B0]"
          : "text-[#5B8291] border-[#C0C0C0]"
      }`}
      onClick={() => toggleWalletExpansion(`solana-${index}`)}
    >
      <div className="flex justify-between items-center">
        <p className="font-bold">Wallet {index + 1}</p>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyAddress(wallet.publicKey);
            }}
            className={`px-2 py-1 border-2 ${
              theme === "dark"
                ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
                : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
            } rounded`}
          >
            Copy
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              confirmDeleteWallet("solana", index);
            }}
            className={`px-2 py-1 border-2 ${
              theme === "dark"
                ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
                : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
            } rounded`}
          >
            Delete
          </button>
        </div>
      </div>
      {expandedWallet === `solana-${index}` && (
        <div className="mt-2 text-sm space-y-2">
          <p>
            <strong>Public Key:</strong> {wallet.publicKey}
          </p>
          <p>
            <strong>Private Key:</strong> {wallet.privateKey.slice(0, 10)}...
          </p>
          <p>
            <strong>Derivation Path:</strong> {wallet.path}
          </p>
          <div className="mt-2">
            <QRCode
              value={wallet.publicKey}
              size={128}
              bgColor={theme === "dark" ? "#1A1F2A" : "#EAEBED"}
              fgColor={theme === "dark" ? "#6B7280" : "#2E424D"}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SolanaWalletCard;
