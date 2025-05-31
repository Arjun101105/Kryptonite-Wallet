import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { useWallet } from "../../contexts/WalletContext";

const DeleteConfirmModal = () => {
  const { theme } = useTheme();
  const { showDeleteConfirm, deleteWallet, cancelDelete } = useWallet();

  // Only render if visible
  if (!showDeleteConfirm.visible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 flex items-center justify-center ${
        theme === "dark" ? "bg-[#1A1F2A] bg-opacity-50" : "bg-[#EAEBED] bg-opacity-30"
      }`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className={`p-6 rounded-lg w-full max-w-md border-4 shadow-lg ${
          theme === "dark" ? "bg-[#2C323F] text-[#E6E8EB] border-[#A1A5B0]" : "bg-[#5B8291] text-[#FFFFFF] border-[#C0C0C0]"
        }`}
      >
        <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
        <p>Are you sure you want to delete this wallet? This action cannot be undone.</p>
        <div className="flex gap-4 mt-4">
          <button
            className={`px-4 py-2 border-2 shadow-md ${
              theme === "dark"
                ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
                : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
            } rounded-lg`}
            onClick={deleteWallet}
          >
            Confirm
          </button>
          <button
            className={`px-4 py-2 border-2 shadow-md ${
              theme === "dark"
                ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
                : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
            } rounded-lg`}
            onClick={cancelDelete}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteConfirmModal;
