// Types for the wallet application

export interface SolanaWallet {
  publicKey: string;
  privateKey: string;
  path: string;
}

export interface EthWallet {
  address: string;
  privateKey: string;
  path: string;
}

export type BlockchainType = "solana" | "ethereum" | "";

export type ThemeType = "dark" | "light";

export interface DeleteConfirmState {
  type: "solana" | "ethereum" | null;
  index: number;
  visible: boolean;
}
