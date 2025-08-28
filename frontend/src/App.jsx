import React from "react";
import { Web3Provider } from "./context/Web3Context";
import Header from "./components/Header";
import DatasetMarketplace from "./components/DatasetMarketplace";
import DatasetUpload from "./components/DatasetUpload";
import MyLicenses from "./components/MyLicenses";
import ProviderRegistration from "./components/ProviderRegistration";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = React.useState("marketplace");

  const renderContent = () => {
    switch (activeTab) {
      case "marketplace":
        return <DatasetMarketplace />;
      case "register":
        return <ProviderRegistration />;
      case "upload":
        return <DatasetUpload />;
      case "licenses":
        return <MyLicenses />;
      default:
        return <DatasetMarketplace />;
    }
  };

  return (
    <Web3Provider>
      <div className="App">
        <Header />

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "marketplace" ? "active" : ""}`}
            onClick={() => setActiveTab("marketplace")}
          >
            📊 Marketplace
          </button>
          <button
            className={`nav-tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            🏥 Become Provider
          </button>
          <button
            className={`nav-tab ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            📤 Upload Dataset
          </button>
          <button
            className={`nav-tab ${activeTab === "licenses" ? "active" : ""}`}
            onClick={() => setActiveTab("licenses")}
          >
            🎫 My Licenses
          </button>
        </nav>

        <main className="main-content">{renderContent()}</main>
      </div>
    </Web3Provider>
  );
}

export default App;
