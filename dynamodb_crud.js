const { DynamoDBClient, CreateTableCommand, DescribeTableCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamoDBEndpoint = "http://localhost:8000";
const region = "us-east-2"; // Change to your desired region
const tableName = "Value1";

//Creating Table - Value1
async function createTable() {
  const client = new DynamoDBClient({ region, endpoint: dynamoDBEndpoint });

  try {
    const describeTableCommand = new DescribeTableCommand({ TableName: tableName });
    await client.send(describeTableCommand);
    console.log(`Table "${tableName}" already exists.`);
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      // const SK =[
      //   { AttributeName: "Zoho", AttributeType: "S" },
      //   { AttributeName: "AUGMONT", AttributeType: "S" },
      //   { AttributeName: "NewToken", AttributeType: "S" },
      //   { AttributeName: "AUGMONT#GOLD_SILVER_RATES", AttributeType: "S" },
      //   { AttributeName: "AUGMONT#PASSBOOK", AttributeType: "S" }
      // ]
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

//Inserting Table - Value1
async function putDataIntoTable() {
  const client = new DynamoDBClient({ region, endpoint: dynamoDBEndpoint });
  const data = {
    Zoho: [
      {
        "Bearer-Token": { S: "" },
        "Key": { S: "" },
        "Value": { S: "" }
      }
    ],
    AUGMONT: [
      {
        "Bearer-Token": { S: "" },
        "Key": { S: "" },
        "Value": { S: "" }
      }
    ],
    NewToken: [
      {
        "Bearer-Token": { S: "" },
        "Key": { S: "" },
        "Value": { S: "" }
      }
    ],
   GSR: [
      {
        "Block_ID": { S: "" },
        "g_buy": { S: "" },
        "g_sell": { S: "" },
        "s_buy": { S: "" },
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
  const dummyData = [
    {
      PK: "Global_Keys",
      SK: JSON.stringify(data),
    }
    // Add more dummy data items as needed
  ];

  for (const item of dummyData) {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        PK: { S: item.PK },
        SK: { S: item.SK }
      }
    });

    try {
      const data = await client.send(command);
      console.log(`Data inserted for ${item.PK} successfully:`, data);
    } catch (error) {
      console.error(`Error inserting data for ${item.PK}:`, error);
    }
  }
}

//Updation-Value1
async function updateDataInTable() {
  const client = new DynamoDBClient({ region, endpoint: dynamoDBEndpoint });
  const dummyData = [
    {
      PK: "Global_Keys",
      SK: JSON.stringify({
        Zoho: [
          {
            "Bearer-Token": { S: "new-value" },  // Update the value here
            "Key": { S: "VID#123" },
            "Value": { S: "Value1" }
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
            "Bearer-Token": { S: "" },
            "Key": { S: "" },
            "Value": { S: "" }
          }
        ],
       GSR: [
          {
            "Block_ID": { S: "" },
            "g_buy": { S: "" },
            "g_sell": { S: "" },
            "s_buy": { S: "" },
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
      }),
    }
    // Add more dummy data items as needed
  ];

  for (const item of dummyData) {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        PK: { S: item.PK },
        SK: { S: item.SK }
      }
    });

    try {
      const data = await client.send(command);
      console.log(`Data updated for ${item.PK} successfully:`, data);
    } catch (error) {
      console.error(`Error updating data for ${item.PK}:`, error);
    }
  }
}


//Main-Call
async function main() {
  //await createTable();
  //await putDataIntoTable();
  await updateDataInTable();
}

main();
