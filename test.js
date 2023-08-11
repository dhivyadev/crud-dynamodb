const { DynamoDBClient, CreateTableCommand, DescribeTableCommand, UpdateTableCommand, DeleteTableCommand } = require("@aws-sdk/client-dynamodb");



class DBTableManager{
  constructor(){
    this.dynamodb = dynamodb;
  };

  // Function to create a DynamoDB table
  async createTable(tableName) {
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
      await dynamodb.send(new CreateTableCommand(params));
      console.log(`Table ${tableName} created successfully.`);
    } catch (error) {
      console.error("Error creating table:", error);
    }
  }

  // Function to read table information
  async readTable(tableName) {
    const params = {
      TableName: tableName
    };

    try {
      const response = await dynamodb.send(new DescribeTableCommand(params));
      console.log("Table description:", response.Table);
    } catch (error) {
      console.error("Error describing table:", error);
    }
  }

  // Function to update table provisioned throughput
  async updateTable(tableName, options = {}) {
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
      await dynamodb.send(new UpdateTableCommand(params));
      console.log("Table updated successfully.");
    } catch (error) {
      console.error("Error updating table:", error);
    }
  }

  // Function to delete a DynamoDB table
  async deleteTable(tableName) {
    const params = {
      TableName: tableName
    };

    try {
      await this.dynamodb.send(new DeleteTableCommand(params));
      console.log(`Table ${tableName} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  }


}

// Configure the AWS credentials and region
const clientConfig = {
  region: "us-east-1", // Replace with your desired AWS region
  endpoint: "http://localhost:8000"
  // Add your AWS credentials here if not using default credentials provider
};

// Initialize the DynamoDB client
const dynamodb = new DynamoDBClient(clientConfig);


const tblmanager = new DBTableManager(dynamodb);

const tableName = "test";  // Replace with your desired table name


//tblmanager.createTable(tableName);
//tblmanager.readTable(tableName)


  // Update table Options examples
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


