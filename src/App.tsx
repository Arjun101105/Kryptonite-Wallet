import { useState } from "react";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { Buffer } from "buffer";
import { Wallet, HDNodeWallet } from "ethers";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";

interface SolanaWallet {
  publicKey: string;
  privateKey: string;
  path: string;
}

interface EthWallet {
  address: string;
  privateKey: string;
  path: string;
}

function App() {
  const [blockchain, setBlockchain] = useState<"solana" | "ethereum" | "">("");
  const [mnemonic, setMnemonic] = useState<string[]>(Array(12).fill(" "));
  const [solanaWallets, setSolanaWallets] = useState<SolanaWallet[]>([]);
  const [ethWallets, setEthWallets] = useState<EthWallet[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSeedVisible, setIsSeedVisible] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [isValidMnemonic, setIsValidMnemonic] = useState<boolean>(true);
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);
  const [importMnemonic, setImportMnemonic] = useState<string>("");
  const [showImport, setShowImport] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: "solana" | "ethereum" | null;
    index: number;
    visible: boolean;
  }>({ type: null, index: -1, visible: false });

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleGenerateWallet = (): void => {
    const mnemonic: string = generateMnemonic();
    const words: string[] = mnemonic.split(" ");
    setMnemonic(words);
    setIsValidMnemonic(true);
    setSolanaWallets([]);
    setEthWallets([]);
    setCurrentIndex(0);
  };

  const handleImportMnemonic = (): void => {
    const words: string[] = importMnemonic.trim().split(/\s+/);
    if (words.length !== 12 || !validateMnemonic(importMnemonic)) {
      alert("Invalid seed phrase. Please enter a valid 12-word phrase.");
      return;
    }
    setMnemonic(words);
    setIsValidMnemonic(true);
    setSolanaWallets([]);
    setEthWallets([]);
    setCurrentIndex(0);
    setShowImport(false);
    setImportMnemonic("");
  };

  const validateSeedPhrase = (): boolean => {
    const mnemonicString: string = mnemonic.join(" ");
    const isValid: boolean = validateMnemonic(mnemonicString);
    setIsValidMnemonic(isValid);
    return isValid;
  };

  const handleAddSolanaWallet = (): void => {
    if (blockchain === "solana" && validateSeedPhrase()) {
      try {
        const mnemonicString: string = mnemonic.join(" ");
        const seed: Buffer = mnemonicToSeedSync(mnemonicString);
        const path: string = `m/44'/501'/${currentIndex}'/0'`;
        const derived = derivePath(path, seed.toString("hex"));
        const keypair: Keypair = Keypair.fromSecretKey(
          nacl.sign.keyPair.fromSeed(derived.key).secretKey
        );

        const publicKey: string = keypair.publicKey.toBase58();
        const privateKey: string = Buffer.from(keypair.secretKey).toString("hex");

        setSolanaWallets([...solanaWallets, { publicKey, privateKey, path }]);
        setCurrentIndex(currentIndex + 1);
      } catch (err) {
        console.error("❌ Failed to create Solana wallet:", err);
        alert("Failed to create Solana wallet.");
      }
    } else if (!isValidMnemonic) {
      alert("Invalid seed phrase.");
    }
  };

  const handleAddEthWallet = (): void => {
    if (blockchain === "ethereum" && validateSeedPhrase()) {
      try {
        const mnemonicString: string = mnemonic.join(" ");
        const seed: Buffer = mnemonicToSeedSync(mnemonicString);
        const derivationPath: string = `m/44'/60'/${currentIndex}'/0'`;
        const hdNode: HDNodeWallet = HDNodeWallet.fromSeed(seed);
        const child: HDNodeWallet = hdNode.derivePath(derivationPath);
        const privateKey: string = child.privateKey;
        const wallet: Wallet = new Wallet(privateKey);

        setEthWallets([...ethWallets, { address: wallet.address, privateKey, path: derivationPath }]);
        setCurrentIndex(currentIndex + 1);
      } catch (err) {
        console.error("❌ Failed to create Ethereum wallet:", err);
        alert("Failed to create Ethereum wallet.");
      }
    } else if (!isValidMnemonic) {
      alert("Invalid seed phrase.");
    }
  };

  const toggleSeedVisibility = (): void => {
    setIsSeedVisible(!isSeedVisible);
  };

  const copySeedToClipboard = (): void => {
    const seedString: string = mnemonic.join(" ");
    navigator.clipboard.writeText(seedString).then(() => {
      alert("Seed phrase copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy seed phrase.");
    });
  };

  const copyAddress = (address: string): void => {
    navigator.clipboard.writeText(address).then(() => {
      alert("Address copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy address.");
    });
  };

  const confirmDeleteWallet = (type: "solana" | "ethereum", index: number): void => {
    setShowDeleteConfirm({ type, index, visible: true });
  };

  const deleteWallet = (): void => {
    if (showDeleteConfirm.type === "solana") {
      setSolanaWallets(solanaWallets.filter((_, i) => i !== showDeleteConfirm.index));
    } else if (showDeleteConfirm.type === "ethereum") {
      setEthWallets(ethWallets.filter((_, i) => i !== showDeleteConfirm.index));
    }
    setShowDeleteConfirm({ type: null, index: -1, visible: false });
  };

  const cancelDelete = (): void => {
    setShowDeleteConfirm({ type: null, index: -1, visible: false });
  };

  const toggleWalletExpansion = (index: string): void => {
    setExpandedWallet(expandedWallet === index ? null : index);
  };

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

        {/* Blockchain Selection */}
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

        {blockchain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Seed Phrase Section */}
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

              {/* Import Seed Phrase Modal */}
              <AnimatePresence>
                {showImport && (
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
                      <h3 className="text-xl font-semibold mb-4">Import Seed Phrase</h3>
                      <textarea
                        value={importMnemonic}
                        onChange={(e) => setImportMnemonic(e.target.value)}
                        placeholder="Enter 12-word seed phrase"
                        className={`w-full p-2 rounded-md ${
                          theme === "dark"
                            ? "bg-[#2C323F] bg-opacity-50 text-[#E6E8EB] border-[#6B7280]"
                            : "bg-[#5B8291] bg-opacity-50 text-[#FFFFFF] border-[#2E424D]"
                        } border-2`}
                        rows={4}
                      />
                      <div className="flex gap-4 mt-4">
                        <button
                          className={`px-4 py-2 border-2 shadow-md ${
                            theme === "dark"
                              ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
                              : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
                          } rounded-lg`}
                          onClick={handleImportMnemonic}
                        >
                          Import
                        </button>
                        <button
                          className={`px-4 py-2 border-2 shadow-md ${
                            theme === "dark"
                              ? "bg-[#6B7280] hover:bg-[#5A606E] text-[#E6E8EB] border-[#A1A5B0]"
                              : "bg-[#2E424D] hover:bg-[#3D5766] text-[#FFFFFF] border-[#C0C0C0]"
                          } rounded-lg`}
                          onClick={() => setShowImport(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
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

            {/* Add Wallet Buttons */}
            {mnemonic[0] !== " " && (
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
            )}

            {/* Wallet Display */}
            {(solanaWallets.length > 0 || ethWallets.length > 0) && (
              <div className="space-y-6">
                {solanaWallets.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Solana Wallets</h3>
                    <div className="grid gap-4">
                      {solanaWallets.map((wallet, index) => (
                        <motion.div
                          key={index}
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
                      ))}
                    </div>
                  </div>
                )}

                {ethWallets.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Ethereum Wallets</h3>
                    <div className="grid gap-4">
                      {ethWallets.map((wallet, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 border-4 ${
                            theme === "dark"
                              ? "bg-[#2C323F] text-[#E6E8EB] border-[#A1A5B0]"
                              : "text-[#5B8291] border-[#C0C0C0]"
                          }`}
                          onClick={() => toggleWalletExpansion(`eth-${index}`)}
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-bold">Wallet {index + 1}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyAddress(wallet.address);
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
                                  confirmDeleteWallet("ethereum", index);
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
                          {expandedWallet === `eth-${index}` && (
                            <div className="mt-2 text-sm space-y-2">
                              <p>
                                <strong>Address:</strong> {wallet.address}
                              </p>
                              <p>
                                <strong>Private Key:</strong> {wallet.privateKey.slice(0, 10)}...
                              </p>
                              <p>
                                <strong>Derivation Path:</strong> {wallet.path}
                              </p>
                              <div className="mt-2">
                                <QRCode
                                  value={wallet.address}
                                  size={128}
                                  bgColor={theme === "dark" ? "#1A1F2A" : "#EAEBED"}
                                  fgColor={theme === "dark" ? "#6B7280" : "#2E424D"}
                                />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm.visible && (
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;