const path = require("path");

// Validate file upload
const validateFileUpload = (req, res, next) => {
  const { metadata, licenseTerms, price, providerAddress } = req.body;

  // Validate required fields
  if (!metadata) {
    return res.status(400).json({ error: "Dataset metadata is required" });
  }

  if (!licenseTerms) {
    return res.status(400).json({ error: "License terms are required" });
  }

  if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    return res.status(400).json({ error: "Valid price is required" });
  }

  if (!providerAddress) {
    return res.status(400).json({ error: "Provider address is required" });
  }

  // Validate file
  if (!req.file) {
    return res.status(400).json({ error: "Dataset file is required" });
  }

  // Validate file size (100MB limit)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      error: "File too large",
      maxSize: "100MB",
      actualSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  // Validate file type
  const allowedExtensions = [".csv", ".json", ".xml", ".txt", ".pdf"];
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({
      error: "Invalid file type",
      allowedTypes: allowedExtensions,
      receivedType: fileExtension,
    });
  }

  // Validate metadata format (should be valid JSON string)
  try {
    JSON.parse(metadata);
  } catch (error) {
    return res.status(400).json({
      error: "Invalid metadata format",
      details: "Metadata must be valid JSON string",
    });
  }

  next();
};

// Validate dataset ID parameter
const validateDatasetId = (req, res, next) => {
  const { datasetId } = req.params;

  if (!datasetId || isNaN(parseInt(datasetId)) || parseInt(datasetId) < 1) {
    return res.status(400).json({
      error: "Invalid dataset ID",
      details: "Dataset ID must be a positive integer",
    });
  }

  req.datasetId = parseInt(datasetId);
  next();
};

// Validate user address parameter
const validateUserAddress = (req, res, next) => {
  const { userAddress } = req.params;
  const { userAddress: queryAddress } = req.query;

  const address = userAddress || queryAddress;

  if (!address) {
    return res.status(400).json({ error: "User address is required" });
  }

  // Ethereum address validation
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(address)) {
    return res.status(400).json({
      error: "Invalid Ethereum address format",
      received: address,
      expected: "0x followed by 40 hexadecimal characters",
    });
  }

  next();
};

// Validate query parameters
const validateQuery = (req, res, next) => {
  const { limit, offset, sortBy, sortOrder } = req.query;

  // Validate limit
  if (
    limit &&
    (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)
  ) {
    return res.status(400).json({
      error: "Invalid limit parameter",
      details: "Limit must be a number between 1 and 100",
    });
  }

  // Validate offset
  if (offset && (isNaN(parseInt(offset)) || parseInt(offset) < 0)) {
    return res.status(400).json({
      error: "Invalid offset parameter",
      details: "Offset must be a non-negative number",
    });
  }

  // Validate sortBy
  const allowedSortFields = ["price", "createdAt", "version", "provider"];
  if (sortBy && !allowedSortFields.includes(sortBy)) {
    return res.status(400).json({
      error: "Invalid sortBy parameter",
      allowedFields: allowedSortFields,
      received: sortBy,
    });
  }

  // Validate sortOrder
  const allowedSortOrders = ["asc", "desc"];
  if (sortOrder && !allowedSortOrders.includes(sortOrder.toLowerCase())) {
    return res.status(400).json({
      error: "Invalid sortOrder parameter",
      allowedValues: allowedSortOrders,
      received: sortOrder,
    });
  }

  next();
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS or injection attempts
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;

    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  };

  // Sanitize body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }

  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === "string") {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }

  next();
};

module.exports = {
  validateFileUpload,
  validateDatasetId,
  validateUserAddress,
  validateQuery,
  sanitizeInput,
};
