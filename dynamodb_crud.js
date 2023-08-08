const { DynamoDBClient, CreateTableCommand, DescribeTableCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamoDBEndpoint = "http://localhost:8000";
const region = "us-east-1"; // Change to your desired region
const tableName = "Value1";

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

async function main() {
  //await createTable();
  await putDataIntoTable();
}

main();
