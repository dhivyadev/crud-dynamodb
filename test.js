const { DynamoDBClient, CreateTableCommand,DescribeTableCommand, PutItemCommand, UpdateItemCommand,GetItemCommand } = require("@aws-sdk/client-dynamodb");

// Configure the DynamoDB client with the endpoint URL
const client = new DynamoDBClient({
  region: "us-east-1", // Replace with your local DynamoDB endpoint
  endpoint: "http://localhost:8000"
});

async function createTable() {
  const tableName = "test";

  // Check if the table already exists
  try {
      await client.send(new DescribeTableCommand({ TableName: tableName }));
      console.log("Table already exists.");
      return; // Exit function if table exists
  } catch (error) {
      if (error.name !== "ResourceNotFoundException") {
          console.error("Error describing table:", error);
          return;
      }
  }

  // Table doesn't exist, proceed to create it
  const params = {
      TableName: tableName,
      KeySchema: [
          { AttributeName: "GlobalKeys", KeyType: "HASH" },
          { AttributeName: "CombinedSortKey", KeyType: "RANGE" }
      ],
      AttributeDefinitions: [
          { AttributeName: "GlobalKeys", AttributeType: "S" },
          { AttributeName: "CombinedSortKey", AttributeType: "S" }
      ],
      BillingMode: "PAY_PER_REQUEST"
  };

  try {
      await client.send(new CreateTableCommand(params));
      console.log("Table created successfully.");
  } catch (error) {
      console.error("Error creating table:", error);
  }
}

// Function to insert an item into the table
async function insertItem(partitionKey, sortKey, attributes) {
    const params = {
        TableName: "test",
        Item: {
            GlobalKeys: { S: partitionKey },
            CombinedSortKey: { S: `${partitionKey}#${sortKey}` },
            ...attributes
        }
    };

    try {
        await client.send(new PutItemCommand(params));
        console.log("Item inserted successfully.");
    } catch (error) {
        console.error("Error inserting item:", error);
    }
}

// Function to update an item's attributes
async function updateItem(partitionKey, sortKey, attributesToUpdate) {
  const updateExpression = "SET " + Object.keys(attributesToUpdate).map(attr => `#${attr} = :${attr}`).join(", ");
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  for (const attr in attributesToUpdate) {
      expressionAttributeNames[`#${attr}`] = attr;
      expressionAttributeValues[`:${attr}`] = attributesToUpdate[attr];
  }

  const params = {
      TableName: "test",
      Key: {
          GlobalKeys: { S: partitionKey },
          CombinedSortKey: { S: `${partitionKey}#${sortKey}` }
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames, // Always use expression attribute names
      ExpressionAttributeValues: expressionAttributeValues
  };

  try {
      await client.send(new UpdateItemCommand(params));
      console.log("Item updated successfully.");
  } catch (error) {
      console.error("Error updating item:", error);
  }
}




async function readItem(partitionKey, sortKey) {
  const params = {
      TableName: "value1_dyno",
      Key: {
          GlobalKeys: { S: partitionKey },
          CombinedSortKey: { S: `${partitionKey}#${sortKey}` }
      }
  };

  try {
      const data = await client.send(new GetItemCommand(params));
      const item = data.Item;
      
      if (item) {
          console.log("Item found:", item);
      } else {
          console.log("Item not found.");
      }
  } catch (error) {
      console.error("Error reading item:", error);
  }
}



// Usage examples
async function main() {
    //await createTable();

    //  await insertItem("Global Keys", "AUGMONT#GOLD_SILVER_RATES#bg007", { //Global_Keys#ZOHO
    //    blockId: { S: "bg007" },
    //    gBuy: { N: "5329.90" },
    //    gSell: { N: "5144.90" },
    //    sBuy: { N: "69.33" },
    //    sSell: { N: "66.33" },
    //    gBuyGst: { S: "5" },
    //    sBuyGst: { N: "5" },
    //    CGSST: { N: "1.50" },
    //    SGST: { N: "1.50" },
    //    IGST: { N: "3.00" },
    //     });
    // Insert or update items for other sort keys as needed

    

    // await updateItem("Global Keys", "NewToken", {
    //   'Bearer_Token' : { S: "Test" },
    // });
    await readItem("Global Keys", "AUGMONT#GOLD_SILVER_RATES"); //Global_Keys#ZOHO

}

main();
