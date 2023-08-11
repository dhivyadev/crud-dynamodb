const { DynamoDBClient, CreateTableCommand, DescribeTableCommand, UpdateTableCommand, DeleteTableCommand } = require("@aws-sdk/client-dynamodb");

// Configure the AWS credentials and region
const clientConfig = {
  region: "us-east-2", // Replace with your desired AWS region
  endpoint: "http://localhost:8000"
  // Add your AWS credentials here if not using default credentials provider
};

// Initialize the DynamoDB client
const dynamodb = new DynamoDBClient(clientConfig);

// Function to create a DynamoDB table
async function createTable(tableName) {
  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: "PK", KeyType: "HASH" }, // Partition key
      { AttributeName: "SK", KeyType: "RANGE" } // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: "PK", AttributeType: "S" },
      { AttributeName: "SK", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    const command = new CreateTableCommand(params);
    await dynamodb.send(command);
    console.log(`Table ${tableName} created successfully.`);
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

// Function to read table information
async function readTable(tableName) {
  const params = {
    TableName: tableName
  };

  try {
    const command = new DescribeTableCommand(params);
    const response = await dynamodb.send(command);
    console.log("Table description:", response.Table);
  } catch (error) {
    console.error("Error describing table:", error);
  }
}

// Function to update table provisioned throughput
async function updateTable(tableName, options = {}) {
    const {
      billingMode = null, // Added billingMode option
      readCapacityUnits = null,
      writeCapacityUnits = null,
      enableTTL = null,
      enablePITR = null,
      enableEncryption = null,
      enableAutoScaling = null,
      gsiUpdates = [],
      lsiUpdates = [],
    } = options;
  
    const params = {
      TableName: tableName,
      AttributeDefinitions: [], // Only needed when creating indexes
      GlobalSecondaryIndexUpdates: gsiUpdates,
      LocalSecondaryIndexUpdates: lsiUpdates,
    };
  
    if (billingMode !== null) {
      params.BillingMode = billingMode; // Set the billing mode
    }
  
    if (readCapacityUnits !== null || writeCapacityUnits !== null) {
      params.ProvisionedThroughput = {
        ReadCapacityUnits: readCapacityUnits,
        WriteCapacityUnits: writeCapacityUnits,
      };
    }
  
    if (enableTTL !== null) {
      params.TimeToLiveSpecification = {
        Enabled: enableTTL,
      };
    }
  
    if (enablePITR !== null) {
      params.PointInTimeRecoverySpecification = {
        PointInTimeRecoveryEnabled: enablePITR,
      };
    }
  
    if (enableEncryption !== null) {
      params.SSESpecification = {
        Enabled: enableEncryption,
      };
    }
  
    if (enableAutoScaling !== null) {
      // Implement auto scaling updates
      // Example: params.BillingMode = enableAutoScaling ? "PAY_PER_REQUEST" : "PROVISIONED";
      // Example: params.AutoScalingSettingsUpdate = ...;
    }
  
    try {
      const command = new UpdateTableCommand(params);
      await dynamodb.send(command);
      console.log("Table updated successfully.");
    } catch (error) {
      console.error("Error updating table:", error);
    }
  }
  

// Function to delete a DynamoDB table
async function deleteTable(tableName) {
  const params = {
    TableName: tableName
  };

  try {
    const command = new DeleteTableCommand(params);
    await dynamodb.send(command);
    console.log(`Table ${tableName} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting table:", error);
  }
}

const tableName = "test"; // Replace with your desired table name

  // Create the table
  //createTable(tableName);

  // Read table information
  //readTable(tableName);

  // Update table provisioned throughput
//   const options = {
//     readCapacityUnits: 10,
//     writeCapacityUnits: 10,
//     enableTTL: true,                             //--test-failed
//     enablePITR: true,                            //--test-failed
//     enableEncryption: true,                      //--test-failed
//     enableAutoScaling: true,                     //--test-failed
//     billingMode: "PAY_PER_REQUEST",         //--test-passed
//     gsiUpdates: [                                //--test-failed
//     ],
//     lsiUpdates: [                                //--test-failed
//     ],
//   };

  
  //updateTable(tableName, options);
  //readTable(tableName);

  //Delete the table
    deleteTable(tableName);

