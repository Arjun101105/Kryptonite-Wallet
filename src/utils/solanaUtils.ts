// Utility functions for Solana wallet operations
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { Buffer } from "buffer";
import { SolanaWallet } from "../types/wallet";

export const generateSeedPhrase = (): string => {
  return generateMnemonic();
};

export const validateSeedPhrase = (mnemonicString: string): boolean => {
  return validateMnemonic(mnemonicString);
};

export const createSolanaWallet = (
  mnemonicString: string, 
  currentIndex: number
): SolanaWallet | null => {
  try {
    const seed: Buffer = mnemonicToSeedSync(mnemonicString);
    const path: string = `m/44'/501'/${currentIndex}'/0'`;
    const derived = derivePath(path, seed.toString("hex"));
    const keypair: Keypair = Keypair.fromSecretKey(
      nacl.sign.keyPair.fromSeed(derived.key).secretKey
    );

    const publicKey: string = keypair.publicKey.toBase58();
    const privateKey: string = Buffer.from(keypair.secretKey).toString("hex");

    return { publicKey, privateKey, path };
  } catch (err) {
    console.error("❌ Failed to create Solana wallet:", err);
    return null;
  }
};
