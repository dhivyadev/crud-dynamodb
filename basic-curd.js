const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");

// Configure AWS credentials and region
const config = {
  region: "us-east-1",
};

// Initialize DynamoDB client
const dynamodb = new DynamoDBClient(config);

// Helper function to convert JSON to DynamoDB attribute format
function marshall(json) {
  return JSON.stringify(json, null, 2);
}

async function insertData(tableName, partitionKey, sortKey, data) {
    const params = {
      TableName: tableName,
      Item: {
        PK: { S: partitionKey },
        SK: { S: sortKey },
        ...data, // Merge the rest of the data
      },
    };
  
    try {
      await dynamodb.send(new PutItemCommand(params));
      console.log("Item inserted successfully:", params.Item);
    } catch (error) {
      console.error("Error inserting item:", error);
    }
  }

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

// async function updateData(tableName, key, updateExpression, expressionAttributeValues) {
//   const params = {
//     TableName: tableName,
//     Key: key,
//     UpdateExpression: updateExpression,
//     ExpressionAttributeValues: marshall(expressionAttributeValues),
//   };

//   try {
//     await dynamodb.send(new UpdateItemCommand(params));
//     console.log("Item updated successfully");
//   } catch (error) {
//     console.error("Error updating item:", error);
//   }
// }


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

// Example data for insert
const newData = {
    BearerToken: { S: "btoken#kjshfdvkjzdbkf" },
    Keys: { S: "code_test" }, // Replace with appropriate data type and value
    values: { N: "897987" }, // Replace with appropriate data type and value
};

// Example update expression and attribute values
const updateExpression = "SET #name = :newName";
const expressionAttributeValues = {
  ":newName": { S: "Updated Name" }, // Replace with appropriate data type and value
};

// Perform CRUD operations


const partitionKey = "Global_Keys";
const sortKey = "TEST";
//insertData(tableName,partitionKey,sortKey, newData);
//getData(tableName, partitionKey, sortKey);

const Updatedata ={
    BearerToken: { S: "update#test" },
    Keys: { S: "update#test" }, 
    values: { N: "000000" }, // will consider as single 0
}

updateItem(tableName,partitionKey,sortKey,Updatedata);
getData(tableName, partitionKey, sortKey);
//deleteData(tableName,partitionKey,sortKey);
