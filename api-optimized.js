const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBTableManager, DynamoDBManager } = require('./dynamodb-utils'); // Import your utility classes from another file

const app = express();
const port = process.env.PORT || 3000;

// Use security-related middleware
app.use(helmet());

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Enable compression
app.use(compression());

// Configure AWS credentials and region or use "aws configure" in CLI
const config = {
  region: "us-east-2", // Change according to your region
  // Use endpoint: "http://localhost:8000" for local DynamoDB access
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000"
};

// Initialize DynamoDB client
const dynamodb = new DynamoDBClient(config);

// Initialize DynamoDB utility classes
const tableManager = new DynamoDBTableManager(dynamodb);
const dataManager = new DynamoDBManager(dynamodb);

// Create a new DynamoDB table
app.post('/createTable/:tableName', async (req, res) => {
  const tableName = req.params.tableName;
  await tableManager.createTable(tableName);
  res.send(`Table ${tableName} created successfully.`);
});

// Get information about a DynamoDB table
app.get('/readTable/:tableName', async (req, res) => {
  const tableName = req.params.tableName;
  const tableInfo = await tableManager.readTable(tableName);
  res.json(tableInfo);
});

// Insert a new item into a DynamoDB table
app.post('/insertData/:tableName/:partitionKey/:sortKey', async (req, res) => {
  const { tableName, partitionKey, sortKey } = req.params;
  const data = req.body; // Assumes JSON data in request body
  await dataManager.insertData(tableName, partitionKey, sortKey, data);
  res.send("Item inserted successfully.");
});

// Update an item in a DynamoDB table
app.put('/updateItem/:tableName/:partitionKey/:sortKey', async (req, res) => {
    const { tableName, partitionKey, sortKey } = req.params;
    const attributesToUpdate = req.body; // Assumes JSON data in request body
    await dataManager.updateItem(tableName, partitionKey, sortKey, attributesToUpdate);
    res.send("Item updated successfully.");
  });

// Get an item from a DynamoDB table
app.get('/getData/:tableName/:partitionKey/:sortKey', async (req, res) => {
    const { tableName, partitionKey, sortKey } = req.params;
    const item = await dataManager.getData(tableName, partitionKey, sortKey);
    if (item) {
      res.json(item);
    } else {
      res.status(404).send("Item not found.");
    }
  });

// Delete an item from a DynamoDB table
app.delete('/deleteData/:tableName/:partitionKey/:sortKey', async (req, res) => {
    const { tableName, partitionKey, sortKey } = req.params;
    await dataManager.deleteData(tableName, partitionKey, sortKey);
    res.send("Item deleted successfully.");
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
