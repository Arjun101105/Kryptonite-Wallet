import { ThemeProvider } from "./contexts/ThemeContext";
import { WalletProvider } from "./contexts/WalletContext";
import MainLayout from "./components/common/MainLayout";

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <MainLayout />
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
