import React, { useState } from "react";
import { useWeb3 } from "../../context/Web3Context";
import "./Navbar.css";

const Navbar = ({ activeTab, setActiveTab }) => {
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: "marketplace", label: "Marketplace", icon: "🏪" },
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "upload", label: "Upload", icon: "📤" },
    { id: "licenses", label: "Licenses", icon: "📋" },
    { id: "register", label: "Register", icon: "🏢" },
    {
      id: "monitoring",
      label: "Monitor",
      icon: "📈",
      roles: ["admin", "dao"],
    },
    { id: "users", label: "Users", icon: "👥", roles: ["admin"] },
  ];

  const handleConnect = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      await connectWallet(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img
            src="/logo.png"
            alt="Clarity - Healthcare Data Marketplace"
            className="brand-logo"
          />
        </div>

        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`navbar-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMenuOpen(false);
              }}
              title={`${item.icon} ${item.label}`}
            >
              <span className="navbar-icon">{item.icon}</span>
              <span className="navbar-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          <button className="connect-button" onClick={handleConnect}>
            {isConnected ? "Connected" : "Connect Wallet"}
          </button>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
