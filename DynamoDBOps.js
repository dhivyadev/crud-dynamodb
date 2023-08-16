const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, 
    DeleteItemCommand, CreateTableCommand, DescribeTableCommand, 
    UpdateTableCommand, DeleteTableCommand } = require("@aws-sdk/client-dynamodb");


//DynamoDBTableManager class to Create, Update, Read and Delete Operation on Dynamodb Table

class DynamoDBTableManager{
  constructor(dynamodb){
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


//DynamoDBManager class to perform CURD on DynamoDB Table items.

class DynamoDBManager {
    constructor(dynamodb) {
      this.dynamodb = dynamodb;
    }
  
    //Inserting data into the Table
    async insertData(tableName, partitionKey, sortKey, data) {
      const params = {
        TableName: tableName,
        Item: {
          PK: { S: partitionKey },
          SK: { S: sortKey },
          ...data, // Merge the rest of the new data
        },
      };
  
      try {
        await this.dynamodb.send(new PutItemCommand(params));
        console.log("Item inserted successfully:", params.Item);
      } catch (error) {
        console.error("Error inserting item:", error);
      }
    }
  
  //GetData- from the table
    async getData(tableName, partitionKey, sortKey) {
      const params = {
        TableName: tableName,
        Key: {
          PK: { S: partitionKey },
          SK: { S: sortKey },
        },
      };
  
      try {
        const response = await this.dynamodb.send(new GetItemCommand(params));
        if (response.Item) {
          console.log("Retrieved item:", response.Item);
        } else {
          console.log("Item not found.");
        }
      } catch (error) {
        console.error("Error retrieving item:", error);
      }
    }
  
    //Update data into the Table
    async updateItem(tableName, partitionKey, sortKey, attributesToUpdate) {
      const updateExpression = "SET " + Object.keys(attributesToUpdate).map(attr => `#${attr} = :${attr}`).join(", ");
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};
  
      for (const attr in attributesToUpdate) {
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
  
      try {
        await this.dynamodb.send(new UpdateItemCommand(params));
        console.log("Item updated successfully.");
      } catch (error) {
        console.error("Error updating item:", error);
      }
    }
  
    //Delete data from the table
    async deleteData(tableName, partitionKey, sortKey) {
      const params = {
        TableName: tableName,
        Key: {
          PK: { S: partitionKey },
          SK: { S: sortKey },
        },
      };
  
      try {
        await this.dynamodb.send(new DeleteItemCommand(params));
        console.log("Item deleted successfully");
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  }







// Configure AWS credentials and region  or use "aws configure" in cli
const config = {
    region: "us-east-2", //change according to your region
    //use endpoint: "http://localhost:8000" for local dynamo access
    endpoint: "http://localhost:8000"
  };

// Initialize DynamoDB client
const dynamodb = new DynamoDBClient(config);





module.exports = { DynamoDBTableManager, DynamoDBManager };