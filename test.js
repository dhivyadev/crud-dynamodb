const { DynamoDBClient, CreateTableCommand, DescribeTableCommand, PutItemCommand, UpdateItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamoDBEndpoint = "http://localhost:8000";
const region = "us-east-2"; // Change to your desired region
const tableName = "Value1";

const data = {
  Zoho: [
    {
      "Bearer-Token": { S: "BID12323" },
      "Key": { S: "BID12323" },
      "Value": { S: "BID12323" }
    }
      ],
      AUGMONT: [
        {
          "Bearer-Token": { S: "BID#45" },
          "Key": { S: "VID#345" },
          "Value": { S: "GoldnSilver" }
        }
      ],
      NewToken: [
        {
          "Bearer-Token": { S: "BID12323" },
          "Key": { S: "BID12323" },
          "Value": { S: "BID12323" }
        }
      ],
      GSR: [
        {
          "Block_ID": { S: "BID12323" },
          "g_buy": { S: "BID12323" },
          "g_sell": { S: "BID12323" },
          "s_buy": { S: "BID12323" },
          "s_sell": { S: "" },
          "gBuyGST": { S: "" },
          "sBuyGST": { S: "" },
          "CGSST": { S: "" },
          "SGST": { S: "" },
          "IGST": { S: "" },
        }
      ],
      Passbook: [
        {
          "Goldgrms": { S: "" },
          "Silvergrms": { S: "" },
          "Updatedat": { S: "" }
        }
      ]
};

async function createTableIfNotExists() {
  const client = new DynamoDBClient({ region, endpoint: dynamoDBEndpoint });

  try {
    const describeTableCommand = new DescribeTableCommand({ TableName: tableName });
    await client.send(describeTableCommand);
    console.log(`Table "${tableName}" already exists.`);
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      const attributeDefinitions = [
        { AttributeName: "PK", AttributeType: "S" },
        { AttributeName: "SK", AttributeType: "S" },
      ];

      const keySchema = [
        { AttributeName: "PK", KeyType: "HASH" },
        { AttributeName: "SK", KeyType: "RANGE" },
      ];

      const provisionedThroughput = {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      };

      const createTableCommand = new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: attributeDefinitions,
        KeySchema: keySchema,
        ProvisionedThroughput: provisionedThroughput,
      });

      try {
        const data = await client.send(createTableCommand);
        console.log("Table created successfully:", data);
      } catch (createError) {
        console.error("Error creating table:", createError);
      }
    } else {
      console.error("Error describing table:", error);
    }
  }
}

async function insertOrUpdateData(data) {
  const client = new DynamoDBClient({ region, endpoint: dynamoDBEndpoint });

  const itemsToInsertOrUpdate = [
    {
      PK: "Global_Keys",
      SK: JSON.stringify(data),
    }
    // ... Add more items as needed
  ];

  for (const item of itemsToInsertOrUpdate) {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        PK: { S: item.PK },
        SK: { S: item.SK }
      }
    });

    try {
      const data = await client.send(command);
      console.log(`Data inserted/updated for ${item.PK} successfully:`, data);
    } catch (error) {
      console.error(`Error inserting/updating data for ${item.PK}:`, error);
    }
  }
}

async function updateGlobalKeys(newData) {
    const client = new DynamoDBClient({ region, endpoint: dynamoDBEndpoint });
  
    const getItemCommand = new GetItemCommand({
      TableName: tableName,
      Key: {
        PK: { S: "Global_Keys" },
        SK: { S: "UpdatedData" }
      }
    });
  
    try {
      const existingData = await client.send(getItemCommand);
  
      const updatedData = {
        ...(existingData.Item ? JSON.parse(existingData.Item.Data.S) : {}),
        ...newData
      };
  
      const updateCommand = new UpdateItemCommand({
        TableName: tableName,
        Key: {
          PK: { S: "Global_Keys" },
          SK: { S: "UpdatedData" }
        },
        UpdateExpression: "SET #data = :data",
        ExpressionAttributeNames: {
          "#data": "Data"
        },
        ExpressionAttributeValues: {
          ":data": { S: JSON.stringify(updatedData) }
        }
      });
  
      try {
        const data = await client.send(updateCommand);
        console.log(`UpdatedData entry updated successfully:`, data);
      } catch (updateError) {
        console.error(`Error updating UpdatedData entry:`, updateError);
      }
    } catch (getItemError) {
      console.error(`Error getting existing UpdatedData entry:`, getItemError);
    }
  }
  
  async function main() {
    const zohoData = {
      Zoho: [
        {
          "Bearer-Token": "new-value-Zoho",
          "Key": "Zoho-Key",
          "Value": "Zoho-Value"
        }
        // Add more Zoho data as needed
      ]
    };
  
    const augmontData = {
      Augmont: [
        {
          "Bearer-Token": "new-value-Augmont",
          "Key": "Augmont-Key",
          "Value": "Augmont-Value"
        }
        // Add more Augmont data as needed
      ]
    };
  
    const newTokenData = {
      NewToken: [
        {
          "Bearer-Token": "new-value-NewToken",
          "Key": "NewToken-Key",
          "Value": "NewToken-Value"
        }
        // Add more NewToken data as needed
      ]
    };
  
    await updateGlobalKeys(zohoData);
    await updateGlobalKeys(augmontData);
    await updateGlobalKeys(newTokenData);
  }
  
  
async function main() {
await createTableIfNotExists();
await insertOrUpdateData(data);
//   await updateData();
}

main();
