import { AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { useWallet } from "../../contexts/WalletContext";
import Header from "../common/Header";
import BlockchainSelector from "../blockchain/BlockchainSelector";
import SeedPhrase from "../wallet/SeedPhrase";
import WalletActions from "../wallet/WalletActions";
import WalletList from "../wallet/WalletList";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

const MainLayout = () => {
  const { theme } = useTheme();
  const { blockchain } = useWallet();

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        theme === "dark"
          ? "bg-[#1A1F2A] text-[#E6E8EB]" // Deep navy background with soft white text
          : "bg-[#EAEBED] text-[#333333]"
      } font-sans`}
    >
      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <Header />

        {/* Blockchain Selection */}
        <BlockchainSelector />

        {blockchain && (
          <>
            {/* Seed Phrase Section */}
            <SeedPhrase />

            {/* Add Wallet Buttons */}
            <WalletActions />

            {/* Wallet Display */}
            <WalletList />
          </>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          <DeleteConfirmModal />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainLayout;
