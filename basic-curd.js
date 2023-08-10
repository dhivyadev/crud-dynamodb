const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");

// Configure AWS credentials and region  or use "aws configure" in cli
const config = {
  region: "us-east-1", //change according to your region
  //use endpoint: "http://localhost:8000" for local dynamo access
};

// Initialize DynamoDB client
const dynamodb = new DynamoDBClient(config);

//Insert Function
//Usage: insertData(<tableName>, <partitionKey>, <sortKey>, <newdata>)
async function insertData(tableName, partitionKey, sortKey, data) {
    const params = {
      TableName: tableName,
      Item: {
        PK: { S: partitionKey },
        SK: { S: sortKey },
        ...data, // Merge the rest of the new data
      },
    };
  
    try {
      await dynamodb.send(new PutItemCommand(params));
      console.log("Item inserted successfully:", params.Item);
    } catch (error) {
      console.error("Error inserting item:", error);
    }
  }
//Read Function
//Usage: getData(<tableName>, <partitionKey>, <sortKey>)
async function getData(tableName, partitionKey, sortKey) {
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
          console.log("Retrieved item:", response.Item);
        } else {
          console.log("Item not found.");
        }
      } catch (error) {
        console.error("Error retrieving item:", error);
      }
  }


//Read Function
//Usage: updateItem(<tableName>, <partitionKey>, <sortKey>, <updatedata>)
async function updateItem(tableName,partitionKey, sortKey, attributesToUpdate) {
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
        ExpressionAttributeNames: expressionAttributeNames, // Always use expression attribute names
        ExpressionAttributeValues: expressionAttributeValues
    };
  
    try {
        await dynamodb.send(new UpdateItemCommand(params));
        console.log("Item updated successfully.");
    } catch (error) {
        console.error("Error updating item:", error);
    }
  }


//Read Function
//Usage: deleteData(<tableName>, <partitionKey>, <sortKey>)
async function deleteData(tableName, partitionKey, sortKey) {
  const params = {
    TableName: tableName,
    Key: {
        PK: { S: partitionKey },
        SK: { S: sortKey },
      },
  };

  try {
    await dynamodb.send(new DeleteItemCommand(params));
    console.log("Item deleted successfully");
  } catch (error) {
    console.error("Error deleting item:", error);
  }
}

// Replace these values with your own
const tableName = "value1_dyno";
const partitionKey = "Global_Keys";
const sortKey = "TEST";


const newData = {
    BearerToken: { S: "btoken#kjshfdvkjzdbkf" },// Replace with appropriate data type and value
    Keys: { S: "code_test" }, // Replace with appropriate data type and value
    values: { N: "897987" }, // Replace with appropriate data type and value
};
//insertData(tableName,partitionKey,sortKey, newData);

//getData(tableName, partitionKey, sortKey);

const Updatedata ={
    BearerToken: { S: "update#test" },
    Keys: { S: "update#test" },
    values: { N: "000000" }, // will consider as single 0
}

updateItem(tableName,partitionKey,sortKey,Updatedata);

//deleteData(tableName,partitionKey,sortKey);
