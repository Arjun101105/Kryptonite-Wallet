import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { useWallet } from "../../contexts/WalletContext";
import ImportSeedModal from "../modals/ImportSeedModal";

const SeedPhrase = () => {
  const { theme } = useTheme();
  const {
    blockchain,
    mnemonic,
    isSeedVisible,
    isValidMnemonic,
    showImport,
    setShowImport,
    handleGenerateWallet,
    toggleSeedVisibility,
    copySeedToClipboard,
  } = useWallet();

  return (
    <div
      className={`p-6 rounded-lg mb-8 border-4 shadow-lg ${
        theme === "dark"
          ? "bg-[#2C323F] text-[#E6E8EB] border-[#A1A5B0]"
          : "text-[#5B8291] border-[#C0C0C0]"
      }`}
    >
      <p className="text-lg mb-4">
        Selected Blockchain: <span className="font-bold capitalize">{blockchain}</span>
      </p>
      <div className="flex gap-4">
        <button
          className={`px-6 py-3 border-2 shadow-md ${
            theme === "dark"
              ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
              : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
          } rounded-lg transition-all duration-300`}
          onClick={handleGenerateWallet}
          disabled={mnemonic[0] !== " "}
          title={mnemonic[0] !== " " ? "Already generated, use Import instead" : ""}
        >
          Generate Seed Phrase
        </button>
        <button
          className={`px-6 py-3 border-2 shadow-md ${
            theme === "dark"
              ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
              : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
          } rounded-lg transition-all duration-300`}
          onClick={() => setShowImport(true)}
        >
          Import Seed Phrase
        </button>
      </div>

      <AnimatePresence>
        {showImport && <ImportSeedModal />}
      </AnimatePresence>

      {mnemonic[0] !== " " && (
        <div className="mt-6">
          <div className="flex gap-4 mb-4">
            <button
              className={`px-4 py-2 border-2 shadow-md ${
                theme === "dark"
                  ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
                  : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
              } rounded-lg transition-all duration-300 ${isSeedVisible ? "bg-opacity-75 border-4" : ""}`}
              onClick={toggleSeedVisibility}
            >
              {isSeedVisible ? "Hide Seed Phrase" : "Show Seed Phrase"}
            </button>
            <button
              className={`px-4 py-2 border-2 shadow-md ${
                theme === "dark"
                  ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
                  : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
              } rounded-lg transition-all duration-300`}
              onClick={copySeedToClipboard}
            >
              Copy Seed Phrase
            </button>
          </div>

          {isSeedVisible && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {mnemonic.map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`text-center px-4 py-2 rounded-md text-sm md:text-base ${
                    theme === "dark"
                      ? "bg-[#2C323F] bg-opacity-50 text-[#E6E8EB] border-[#6B7280]"
                      : "bg-[#5B8291] bg-opacity-50 text-[#FFFFFF] border-[#2E424D]"
                  } border-2`}
                >
                  {index + 1}. {word}
                </motion.span>
              ))}
            </div>
          )}
          {!isValidMnemonic && <p className="text-red-500">Invalid seed phrase detected.</p>}
          <p className={`text-gray-600 ${theme === "dark" ? "text-[#6B7280]" : "text-[#2E424D]"} text-sm`}>
            Save these words securely. Do not share them with anyone.
          </p>
        </div>
      )}
    </div>
  );
};

export default SeedPhrase;
