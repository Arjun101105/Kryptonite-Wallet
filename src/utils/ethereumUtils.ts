// Utility functions for Ethereum wallet operations
import { mnemonicToSeedSync } from "bip39";
import { Buffer } from "buffer";
import { Wallet, HDNodeWallet } from "ethers";
import { EthWallet } from "../types/wallet";

export const createEthWallet = (
  mnemonicString: string, 
  currentIndex: number
): EthWallet | null => {
  try {
    const seed: Buffer = mnemonicToSeedSync(mnemonicString);
    const derivationPath: string = `m/44'/60'/${currentIndex}'/0'`;
    const hdNode: HDNodeWallet = HDNodeWallet.fromSeed(seed);
    const child: HDNodeWallet = hdNode.derivePath(derivationPath);
    const privateKey: string = child.privateKey;
    const wallet: Wallet = new Wallet(privateKey);

    return {
      address: wallet.address,
      privateKey,
      path: derivationPath,
    };
  } catch (err) {
    console.error("❌ Failed to create Ethereum wallet:", err);
    return null;
  }
};
