import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

// Initialization
const ddbDocClient = createDDbDocClient();
// Handler
export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    const gameId = event.pathParameters?.gameId;
    const includeDevelopers = event.queryStringParameters?.developers === "true";

    if (!gameId) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Missing game Id" }),
      };
    }
    const commandOutput = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id: parseInt(gameId, 10) },
      })
    );
    if (!commandOutput.Item) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Invalid game Id" }),
      };
    }
    const body: { data: Record<string, any>; developers?: any[] } = {
      data: commandOutput.Item,
    };

    if (includeDevelopers) {
      const developersOutput = await ddbDocClient.send(
        new QueryCommand({
          TableName: process.env.DEVELOPERS_TABLE_NAME,
          KeyConditionExpression: "gameId = :gameId",
          ExpressionAttributeValues: { ":gameId": parseInt(gameId, 10) }
        })
      );

      body.developers = developersOutput.Items || [];
    }

    // Return Response
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
