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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isValidMnemonic, setIsValidMnemonic] = useState<boolean>(true);
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);
  const [importMnemonic, setImportMnemonic] = useState<string>("");
  const [showImport, setShowImport] = useState<boolean>(false);

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

  const deleteWallet = (type: "solana" | "ethereum", index: number): void => {
    if (type === "solana") {
      setSolanaWallets(solanaWallets.filter((_, i) => i !== index));
    } else {
      setEthWallets(ethWallets.filter((_, i) => i !== index));
    }
  };

  const toggleWalletExpansion = (index: string): void => {
    setExpandedWallet(expandedWallet === index ? null : index);
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 to-blue-950 text-gray-100"
          : "bg-gray-50 text-gray-900"
      } font-sans`}
    >
      <div className="container mx-auto p-6 md:p-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">
            Kryptonite Wallet
          </h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              theme === "dark" ? "bg-gray-800 hover:bg-gray-700 text-gray-100" : "bg-gray-200 hover:bg-gray-300 text-gray-900"
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Kryptonite supports multiple blockchains for secure wallet management.
          </p>
          <div className="flex gap-4">
            <button
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                blockchain === "solana"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
              onClick={() => setBlockchain("solana")}
            >
              Solana
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                blockchain === "ethereum"
                  ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                  : theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
              onClick={() => setBlockchain("ethereum")}
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
              className={`p-6 rounded-lg mb-8 ${
                theme === "dark" ? "bg-gray-800 bg-opacity-50" : "bg-white shadow-md"
              }`}
            >
              <p className="text-lg mb-4">
                Selected Blockchain: <span className="font-bold capitalize">{blockchain}</span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleGenerateWallet}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                >
                  Generate Seed Phrase
                </button>
                <button
                  onClick={() => setShowImport(true)}
                  className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
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
                      theme === "dark" ? "bg-black bg-opacity-50" : "bg-gray-900 bg-opacity-30"
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className={`p-6 rounded-lg w-full max-w-md ${
                        theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
                      }`}
                    >
                      <h3 className="text-xl font-semibold mb-4">Import Seed Phrase</h3>
                      <textarea
                        value={importMnemonic}
                        onChange={(e) => setImportMnemonic(e.target.value)}
                        placeholder="Enter 12-word seed phrase"
                        className={`w-full p-2 rounded-md ${
                          theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
                        }`}
                        rows={4}
                      />
                      <div className="flex gap-4 mt-4">
                        <button
                          onClick={handleImportMnemonic}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600"
                        >
                          Import
                        </button>
                        <button
                          onClick={() => setShowImport(false)}
                          className={`px-4 py-2 rounded-lg ${
                            theme === "dark"
                              ? "bg-gray-800 text-gray-200"
                              : "bg-gray-200 text-gray-800"
                          }`}
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
                      onClick={toggleSeedVisibility}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      }`}
                    >
                      {isSeedVisible ? "Hide Seed Phrase" : "Show Seed Phrase"}
                    </button>
                    <button
                      onClick={copySeedToClipboard}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      }`}
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
                            theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {index + 1}. {word}
                        </motion.span>
                      ))}
                    </div>
                  )}
                  {!isValidMnemonic && <p className="text-red-500">Invalid seed phrase detected.</p>}
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Save these words securely. Do not share them with anyone.
                  </p>
                </div>
              )}
            </div>

            {/* Add Wallet Buttons */}
            {mnemonic[0] !== " " && (
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddSolanaWallet}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                >
                  Add Solana Wallet
                </button>
                <button
                  onClick={handleAddEthWallet}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
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
                          className={`p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 ${
                            theme === "dark" ? "bg-gray-800" : "bg-white"
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
                                className="text-orange-400 hover:text-orange-300"
                              >
                                Copy
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteWallet("solana", index);
                                }}
                                className="text-red-500 hover:text-red-400"
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
                                  bgColor={theme === "dark" ? "#1F2937" : "#FFFFFF"}
                                  fgColor={theme === "dark" ? "#FFFFFF" : "#000000"}
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
                          className={`p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 ${
                            theme === "dark" ? "bg-gray-800" : "bg-white"
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
                                className="text-orange-400 hover:text-orange-300"
                              >
                                Copy
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteWallet("ethereum", index);
                                }}
                                className="text-red-500 hover:text-red-400"
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
                                  bgColor={theme === "dark" ? "#1F2937" : "#FFFFFF"}
                                  fgColor={theme === "dark" ? "#FFFFFF" : "#000000"}
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
      </div>
    </div>
  );
}

export default App;