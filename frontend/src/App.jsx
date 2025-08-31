import React from "react";
import { Web3Provider } from "./context/Web3Context";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Layout/Navbar";
import ThemeToggle from "./components/Layout/ThemeToggle";
import Dashboard from "./components/Dashboard";
import DatasetMarketplace from "./components/DatasetMarketplace";
import DatasetUpload from "./components/DatasetUpload";
import MyLicenses from "./components/MyLicenses";
import ProviderRegistration from "./components/ProviderRegistration";
import DAOGovernance from "./components/DAOGovernance";
import TransactionMonitoring from "./components/TransactionMonitoring";
import UserManagement from "./components/UserManagement";
import OwnershipVerification from "./components/OwnershipVerification";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = React.useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "marketplace":
        return <DatasetMarketplace />;
      case "register":
        return <ProviderRegistration />;
      case "upload":
        return <DatasetUpload />;
      case "licenses":
        return <MyLicenses />;
      case "verify":
        return <OwnershipVerification />;
      case "monitoring":
        return <TransactionMonitoring />;
      case "users":
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <Web3Provider>
        <div className="App">
          {/* <ThemeToggle /> */}
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="main-content">{renderContent()}</main>
        </div>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;
