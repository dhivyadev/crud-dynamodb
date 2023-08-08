const AWS = require('aws-sdk');

// Configure AWS to use DynamoDB Local
AWS.config.update({ region: 'localhost', endpoint: 'http://localhost:8000' });

// Create a DynamoDB client and DocumentClient
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

// Create the table with the required schema
const tableName = 'YourTableName'; // Replace 'YourTableName' with your desired table name

const createTableParams = {
  TableName: tableName,
  KeySchema: [
    { AttributeName: 'GlobalKeys', KeyType: 'HASH' }, // Partition key
    { AttributeName: 'ZohoAugmontNewToken', KeyType: 'RANGE' }, // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'GlobalKeys', AttributeType: 'S' }, // String data type for the partition key
    { AttributeName: 'ZohoAugmontNewToken', AttributeType: 'S' }, // String data type for the sort key
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

// Check if the table exists before creating it
dynamodb.describeTable({ TableName: tableName }, (err, data) => {
  if (err && err.code === 'ResourceNotFoundException') {
    // Table does not exist, create it
    dynamodb.createTable(createTableParams, (err, data) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Table created successfully:', data);
        // Perform CRUD operations here
        performCRUDOperations();
      }
    });
  } else if (err) {
    console.error('Error describing table:', err);
  } else {
    console.log('Table exists:', data);
    // Table already exists, perform CRUD operations directly
    performCRUDOperations();
  }
});

// Function to perform CRUD operations
const performCRUDOperations = () => {
  // Create operation
  const createItem = (data) => {
    const params = {
      TableName: tableName,
      Item: data,
    };

    docClient.put(params, (err, data) => {
      if (err) {
        console.error('Error creating item:', err);
      } else {
        console.log('Item created successfully:', data);
        // Read the created item
        readItem(data.GlobalKeys, data.ZohoAugmontNewToken);
      }
    });
  };

  // Read operation
  const readItem = (globalKeys, zohoAugmontNewToken) => {
    const params = {
      TableName: tableName,
      Key: {
        GlobalKeys: globalKeys,
        ZohoAugmontNewToken: zohoAugmontNewToken,
      },
    };

    docClient.get(params, (err, data) => {
      if (err) {
        console.error('Error reading item:', err);
      } else {
        console.log('Item retrieved successfully:', data.Item);
        // Update the retrieved item
        updateItem(data.GlobalKeys, data.ZohoAugmontNewToken, { BearerToken: 'UpdatedBearerTokenValue' });
      }
    });
  };

  // Update operation
  const updateItem = (globalKeys, zohoAugmontNewToken, attributesToUpdate) => {
    const updateExpression = 'SET ' + Object.keys(attributesToUpdate).map((key) => `#${key} = :${key}`).join(', ');
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.entries(attributesToUpdate).forEach(([key, value]) => {
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    });

    const params = {
      TableName: tableName,
      Key: {
        GlobalKeys: globalKeys,
        ZohoAugmontNewToken: zohoAugmontNewToken,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'UPDATED_NEW',
    };

    docClient.update(params, (err, data) => {
      if (err) {
        console.error('Error updating item:', err);
      } else {
        console.log('Item updated successfully:', data);
        // Delete the item after update
        deleteItem(data.GlobalKeys, data.ZohoAugmontNewToken);
      }
    });
  };

  // Delete operation
  const deleteItem = (globalKeys, zohoAugmontNewToken) => {
    const params = {
      TableName: tableName,
      Key: {
        GlobalKeys: globalKeys,
        ZohoAugmontNewToken: zohoAugmontNewToken,
      },
    };

    docClient.delete(params, (err, data) => {
      if (err) {
        console.error('Error deleting item:', err);
      } else {
        console.log('Item deleted successfully:', data);
      }
    });
  };

  // Example usage:
  const dataToCreate = {
    GlobalKeys: 'YourGlobalKeysValue',
    ZohoAugmontNewToken: 'YourZohoAugmontNewTokenValue',
    BearerToken: 'YourBearerTokenValue',
    Keys: 'YourKeysValue',
    Values: 'YourValuesValue',
  };

  createItem(dataToCreate);
};
