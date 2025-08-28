import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import "./DatasetUpload.css";

const DatasetUpload = () => {
  const { datasetSBTContract, account, isConnected } = useWeb3();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "medical",
    licenseTerms: "Research use only",
    price: "0.1",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [checkingProvider, setCheckingProvider] = useState(false);

  // Check if user is a dataset provider
  const checkProviderStatus = async () => {
    if (!account) return;

    try {
      setCheckingProvider(true);
      const response = await fetch(
        `http://localhost:3001/api/is-provider/${account}`
      );

      if (response.ok) {
        const data = await response.json();
        setIsProvider(data.isProvider);
      }
    } catch (error) {
      console.error("Error checking provider status:", error);
    } finally {
      setCheckingProvider(false);
    }
  };

  useEffect(() => {
    if (account) {
      checkProviderStatus();
    }
  }, [account]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  // Upload to IPFS via backend API
  const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("dataset", file);
    formData.append(
      "metadata",
      JSON.stringify({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        fileSize: file.size,
        fileName: file.name,
        uploadedAt: Date.now(),
      })
    );
    formData.append("licenseTerms", formData.licenseTerms);
    formData.append("price", formData.price);
    formData.append("providerAddress", account);

    const response = await fetch("http://localhost:3001/api/upload-dataset", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || "Upload failed");
    }

    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected || !account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!formData.file) {
      alert("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);

      // Upload file to IPFS via backend API
      console.log("Uploading to IPFS via backend...");
      const uploadResult = await uploadToIPFS(formData.file);

      console.log("Upload successful:", uploadResult);
      alert(
        `Dataset uploaded successfully!\nIPFS Hash: ${uploadResult.ipfsHash}\nDataset ID: ${uploadResult.datasetId}`
      );

      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "medical",
        licenseTerms: "Research use only",
        price: "0.1",
        file: null,
      });

      // Reset file input
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading dataset:", error);
      alert("Error uploading dataset: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="upload-container">
        <h2>Upload Dataset</h2>
        <p>Please connect your wallet to upload datasets.</p>
      </div>
    );
  }

  if (checkingProvider) {
    return (
      <div className="upload-container">
        <h2>Upload Dataset</h2>
        <p>Checking provider status...</p>
      </div>
    );
  }

  if (!isProvider) {
    return (
      <div className="upload-container">
        <h2>Upload Dataset</h2>
        <div className="provider-required">
          <h3>🔒 Provider Registration Required</h3>
          <p>
            You need to register as a dataset provider before you can upload
            datasets.
          </p>
          <p>
            Go to the <strong>"Become Provider"</strong> tab to register (it's
            free and instant).
          </p>
          <div className="provider-benefits-mini">
            <h4>After registration, you'll be able to:</h4>
            <ul>
              <li>✅ Upload encrypted datasets to IPFS</li>
              <li>✅ Set your own licensing terms and prices</li>
              <li>✅ Earn royalties from license sales</li>
              <li>✅ Track dataset usage and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <h2>Upload Healthcare Dataset</h2>
      <p>
        Upload your healthcare dataset to the blockchain for secure licensing.
      </p>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="name">Dataset Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="e.g., COVID-19 Patient Records"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            placeholder="Describe your dataset..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Dataset Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="medical">Medical Records</option>
              <option value="imaging">Medical Imaging</option>
              <option value="genomic">Genomic Data</option>
              <option value="clinical">Clinical Trial Data</option>
              <option value="research">Research Data</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (ETH) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="licenseTerms">License Terms</label>
          <select
            id="licenseTerms"
            name="licenseTerms"
            value={formData.licenseTerms}
            onChange={handleInputChange}
          >
            <option value="Research use only">Research use only</option>
            <option value="Commercial use allowed">
              Commercial use allowed
            </option>
            <option value="Educational use only">Educational use only</option>
            <option value="Non-commercial use">Non-commercial use</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="file-input">Dataset File *</label>
          <input
            type="file"
            id="file-input"
            onChange={handleFileChange}
            required
            accept=".csv,.json,.xlsx,.zip"
          />
          <small>Supported formats: CSV, JSON, XLSX, ZIP</small>
        </div>

        <div className="upload-info">
          <h3>Important Notes:</h3>
          <ul>
            <li>
              Ensure your dataset is properly anonymized and complies with
              HIPAA/GDPR
            </li>
            <li>The file will be encrypted and stored on IPFS</li>
            <li>You will receive royalties from each license sale</li>
            <li>Dataset metadata will be stored immutably on the blockchain</li>
          </ul>
        </div>

        <button type="submit" className="upload-button" disabled={uploading}>
          {uploading ? (
            <>
              <span className="spinner"></span>
              Uploading...
            </>
          ) : (
            "Upload Dataset"
          )}
        </button>
      </form>
    </div>
  );
};

export default DatasetUpload;
