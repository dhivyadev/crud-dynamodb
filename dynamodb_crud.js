const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");

async function createTable() {
  // Configure the AWS SDK with your credentials and region
  const client = new DynamoDBClient({ region: "us-east-2" }); // Replace "us-east-2" with your desired region

  // Specify your desired table name
  const tableName = "YourTableName";

  try {
    // Check if the table already exists by describing the table
    const describeTableCommand = new DescribeTableCommand({ TableName: tableName });
    await client.send(describeTableCommand);
    console.log(`Table "${tableName}" already exists.`);
  } catch (error) {
    // If the table does not exist, create it
    if (error.name === "ResourceNotFoundException") {
      // Define the attribute definitions for the table
      const attributeDefinitions = [
        { AttributeName: "GlobalKeys", AttributeType: "S" },
        { AttributeName: "Zoho", AttributeType: "S" },
        { AttributeName: "Augmont", AttributeType: "S" },
        { AttributeName: "newToken", AttributeType: "S" },
      ];

      // Define the key schema for the table
      const keySchema = [
        { AttributeName: "GlobalKeys", KeyType: "HASH" }, // Partition key (PK)
        { AttributeName: "Zoho", KeyType: "RANGE" }, // Sort key (SK) - Part of the composite sort key
        { AttributeName: "Augmont", KeyType: "RANGE" }, // Sort key (SK) - Part of the composite sort key
        { AttributeName: "newToken", KeyType: "RANGE" }, // Sort key (SK) - Part of the composite sort key
      ];

      // Define the provisioned throughput (change as per your requirements)
      const provisionedThroughput = {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      };

      // Create the table command
      const createTableCommand = new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: attributeDefinitions,
        KeySchema: keySchema,
        ProvisionedThroughput: provisionedThroughput,
      });

      try {
        // Send the CreateTable command to AWS DynamoDB service
        const data = await client.send(createTableCommand);
        console.log("Table created successfully:", data);
      } catch (createError) {
        console.error("Error creating table:", createError);
      }
    } else {
      // For any other error, print the error message
      console.error("Error describing table:", error);
    }
  }
}
// Call the createTable function to create the table or show if it already exists
createTable();

async function putDataIntoTable() {
    // Configure the AWS SDK with your credentials and region
    const client = new DynamoDBClient({ region: "us-east-2" }); // Replace "us-east-2" with your desired region
  
    // Specify your table name
    const tableName = "YourTableName";
  
    // Sample dummy data to be inserted
    const dummyData = [
      {
        GlobalKeys: "key1",
        Zoho: "zoho1",
        Augmont: "augmont1",
        newToken: "newtoken1",
        Bearer_Token: "bearer1",
        Key: "key1",
        Value: "value1",
      },
      {
        GlobalKeys: "key2",
        Zoho: "zoho2",
        Augmont: "augmont2",
        newToken: "newtoken2",
        Bearer_Token: "bearer2",
        Key: "key2",
        Value: "value2",
      },
      // Add more dummy data items as needed
    ];
  
    // Insert each item in the dummy data array into the table
    for (const item of dummyData) {
      // Create the PutItem command for each item
      const command = new PutItemCommand({
        TableName: tableName,
        Item: {
          GlobalKeys: { S: item.GlobalKeys },
          Zoho: { S: item.Zoho },
          Augmont: { S: item.Augmont },
          newToken: { S: item.newToken },
          Bearer_Token: { S: item.Bearer_Token },
          Key: { S: item.Key },
          Value: { S: item.Value },
        },
      });
  
      try {
        // Send the PutItem command to AWS DynamoDB service to write the data
        const data = await client.send(command);
        console.log(`Data inserted for ${item.GlobalKeys} successfully:`, data);
      } catch (error) {
        console.error(`Error inserting data for ${item.GlobalKeys}:`, error);
      }
    }
  }
  
  // Call the putDataIntoTable function to insert dummy data into the table
  putDataIntoTable();
