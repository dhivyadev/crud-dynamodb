const express = require("express");
const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand,
    DeleteItemCommand, CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");


const app = express();
app.use(express.json()); // Parse JSON request bodies

// Configure AWS credentials and region or use "aws configure" in cli
const config = {
  region: "us-east-2", // Change according to your region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // Use endpoint: "http://localhost:8000" for local dynamo access
  endpoint: "http://localhost:8000"
};

// Initialize DynamoDB client
const dynamodb = new DynamoDBClient(config);
//
app.post("/createTable", async (req, res) => {
  const{tableName,partitionKey,sortKey}=req.body;
  const params = {
      TableName: tableName,
      KeySchema: [
        { AttributeName: partitionKey, KeyType: "HASH" }, // Partition key
        { AttributeName: sortKey, KeyType: "RANGE" } // Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: partitionKey, AttributeType: "S" },
        { AttributeName: sortKey, AttributeType: "S" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
  
    try {
      await dynamodb.send(new CreateTableCommand(params));
      res.status(201).json({ message: `Table ${tableName} created successfully.` });
    } catch (error) {
      res.status(500).json({ error: "Error creating table." });
    }
  });

app.get("/readTable", async (req, res) => {
    const tableName = req.query.tableName; // Extract the tableName parameter
    console.log(tableName); // Check if tableName is being correctly received
    
    const params = {
      TableName: tableName
    };
  
    try {
      const response = await dynamodb.send(new DescribeTableCommand(params));
      res.status(200).json({ tableDescription: response.Table });
    } catch (error) {
      res.status(500).json({ error: "Error describing table.", msg: error });
    }
});



// DynamoDBManager functions as API routes
app.post("/insertData", async (req, res) => {
  const {tableName,partitionKey,sortKey,data} = req.body;
  const params = {
      TableName: tableName,
      Item: {
        PK: { S: partitionKey },
        SK: { S: sortKey },
        ...data
      }
    };
  
    try {
      await dynamodb.send(new PutItemCommand(params));
      res.status(201).json({ message: "Item inserted successfully.", insertedItem: params.Item });
    } catch (error) {
      res.status(500).json({ error: "Error inserting item." });
    }
  });
  

app.get("/getData", async (req, res) => {
  const{tableName,partitionKey,sortKey}=req.query;
  const params = {
    TableName: tableName,
    Key: {
      PK: { S: partitionKey },
      SK: { S: sortKey },
    },
  };
  
  try {
    const response = await dynamodb.send(new GetItemCommand(params));
    if (response.Item) {
      res.status(200).json({ retrievedItem: response.Item });
    }else{
      res.status(404).json({ message: "Item not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Error retrieving item." });
  }
});

app.put("/updateItem", async (req, res) => {
  const{tableName,partitionKey,sortKey,attributesToUpdate}=req.body;
  
  const updateExpression = "SET " + Object.keys(attributesToUpdate).map(attr => `#${attr} = :${attr}`).join(", ");
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  
  for(const attr in attributesToUpdate) {
    expressionAttributeNames[`#${attr}`] = attr;
    expressionAttributeValues[`:${attr}`] = attributesToUpdate[attr];
  }
  
  const params = {
    TableName: tableName,
    Key: {
      PK: { S: partitionKey },
      SK: { S: sortKey }
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  };
  
  try{
    await dynamodb.send(new UpdateItemCommand(params));
    res.status(200).json({ message: "Item updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error updating item." });
  }
});

app.delete("/deleteData", async (req, res) => {
  const{tableName,partitionKey,sortKey}=req.body;
  const params = {
    TableName: tableName,
    Key: {
      PK: { S: partitionKey },
      SK: { S: sortKey },
    },
  };

  try {
    await dynamodb.send(new DeleteItemCommand(params));
    res.status(200).json({ message: "Item deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error deleting item." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
