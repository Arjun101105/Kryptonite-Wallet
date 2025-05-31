import { createContext, useState, useContext, ReactNode } from "react";
import { SolanaWallet, EthWallet, BlockchainType, DeleteConfirmState } from "../types/wallet";
import { createSolanaWallet } from "../utils/solanaUtils";
import { createEthWallet } from "../utils/ethereumUtils";
import { validateMnemonic, generateMnemonic } from "bip39";

interface WalletContextType {
  blockchain: BlockchainType;
  setBlockchain: (blockchain: BlockchainType) => void;
  mnemonic: string[];
  setMnemonic: (mnemonic: string[]) => void;
  solanaWallets: SolanaWallet[];
  setSolanaWallets: (wallets: SolanaWallet[]) => void;
  ethWallets: EthWallet[];
  setEthWallets: (wallets: EthWallet[]) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isSeedVisible: boolean;
  setIsSeedVisible: (visible: boolean) => void;
  isValidMnemonic: boolean;
  setIsValidMnemonic: (valid: boolean) => void;
  expandedWallet: string | null;
  setExpandedWallet: (wallet: string | null) => void;
  importMnemonic: string;
  setImportMnemonic: (mnemonic: string) => void;
  showImport: boolean;
  setShowImport: (show: boolean) => void;
  showDeleteConfirm: DeleteConfirmState;
  setShowDeleteConfirm: (state: DeleteConfirmState) => void;
  handleGenerateWallet: () => void;
  handleImportMnemonic: () => void;
  validateSeedPhrase: () => boolean;
  handleAddSolanaWallet: () => void;
  handleAddEthWallet: () => void;
  toggleSeedVisibility: () => void;
  copySeedToClipboard: () => void;
  copyAddress: (address: string) => void;
  confirmDeleteWallet: (type: "solana" | "ethereum", index: number) => void;
  deleteWallet: () => void;
  cancelDelete: () => void;
  toggleWalletExpansion: (index: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [blockchain, setBlockchain] = useState<BlockchainType>("");
  const [mnemonic, setMnemonic] = useState<string[]>(Array(12).fill(" "));
  const [solanaWallets, setSolanaWallets] = useState<SolanaWallet[]>([]);
  const [ethWallets, setEthWallets] = useState<EthWallet[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSeedVisible, setIsSeedVisible] = useState<boolean>(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState<boolean>(true);
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);
  const [importMnemonic, setImportMnemonic] = useState<string>("");
  const [showImport, setShowImport] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<DeleteConfirmState>({ 
    type: null, 
    index: -1, 
    visible: false 
  });

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
      const mnemonicString: string = mnemonic.join(" ");
      const wallet = createSolanaWallet(mnemonicString, currentIndex);
      
      if (wallet) {
        setSolanaWallets([...solanaWallets, wallet]);
        setCurrentIndex(currentIndex + 1);
      } else {
        alert("Failed to create Solana wallet.");
      }
    } else if (!isValidMnemonic) {
      alert("Invalid seed phrase.");
    }
  };

  const handleAddEthWallet = (): void => {
    if (blockchain === "ethereum" && validateSeedPhrase()) {
      const mnemonicString: string = mnemonic.join(" ");
      const wallet = createEthWallet(mnemonicString, currentIndex);
      
      if (wallet) {
        setEthWallets([...ethWallets, wallet]);
        setCurrentIndex(currentIndex + 1);
      } else {
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
    <WalletContext.Provider
      value={{
        blockchain,
        setBlockchain,
        mnemonic,
        setMnemonic,
        solanaWallets,
        setSolanaWallets,
        ethWallets,
        setEthWallets,
        currentIndex,
        setCurrentIndex,
        isSeedVisible,
        setIsSeedVisible,
        isValidMnemonic,
        setIsValidMnemonic,
        expandedWallet,
        setExpandedWallet,
        importMnemonic,
        setImportMnemonic,
        showImport,
        setShowImport,
        showDeleteConfirm,
        setShowDeleteConfirm,
        handleGenerateWallet,
        handleImportMnemonic,
        validateSeedPhrase,
        handleAddSolanaWallet,
        handleAddEthWallet,
        toggleSeedVisibility,
        copySeedToClipboard,
        copyAddress,
        confirmDeleteWallet,
        deleteWallet,
        cancelDelete,
        toggleWalletExpansion,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  
  return context;
};
