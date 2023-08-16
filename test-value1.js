const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");

//Class-Constructor
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
  region: "ap-south-1", //change according to your region
  //use endpoint: "http://localhost:8000" for local dynamo access
  endpoint: "http://localhost:8001"
};

// Initialize DynamoDB client
const dynamodb = new DynamoDBClient(config);
const dbManager = new DynamoDBManager(dynamodb);

// Replace these values with your own
const tableName = "Value1_Collection";
const partitionKey = "USERS";
const sortKey = "Subid#userdata#datetime";

const newData = {
    EmailID: { S: "btoken#kjshfdvkjzdbkf" },
};
//dbManager.insertData(tableName,partitionKey,sortKey, newData);

dbManager.getData(tableName, partitionKey, sortKey);

const Updatedata ={
    EmailID: { S: "ragav@admin1.heptre" }
    // will consider as single 0
}

dbManager.updateItem(tableName,partitionKey,sortKey,Updatedata);

//dbManager.deleteData(tableName,partitionKey,sortKey);
