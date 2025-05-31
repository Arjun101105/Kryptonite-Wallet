import { useWallet } from "../../contexts/WalletContext";
import SolanaWalletCard from "./SolanaWalletCard";
import EthereumWalletCard from "./EthereumWalletCard";

const WalletList = () => {
  const { solanaWallets, ethWallets } = useWallet();

  // Only show this component if there are wallets to display
  if (solanaWallets.length === 0 && ethWallets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {solanaWallets.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Solana Wallets</h3>
          <div className="grid gap-4">
            {solanaWallets.map((wallet, index) => (
              <SolanaWalletCard key={index} wallet={wallet} index={index} />
            ))}
          </div>
        </div>
      )}

      {ethWallets.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Ethereum Wallets</h3>
          <div className="grid gap-4">
            {ethWallets.map((wallet, index) => (
              <EthereumWalletCard key={index} wallet={wallet} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletList;
