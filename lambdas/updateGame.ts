import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json";

const ajv = new Ajv();
const isValidBodyParams = ajv.compile(schema.definitions["GameUpdate"] || {});

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    const gameId = event.pathParameters?.gameId;
    const body: Record<string, any> = event.body ? JSON.parse(event.body) : undefined;

    if (!gameId) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Missing gameId in request path" }),
      };
    }

    if (!body) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    if (!isValidBodyParams(body)) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: "Incorrect body type. Must match GameUpdate schema",
          schema: schema.definitions["GameUpdate"],
        }),
      };
    }


    const userId = (event.requestContext as any).authorizer?.claims?.sub;
    console.log("Token userId:", userId);

    if (!userId) {
      return {
        statusCode: 403,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "User not authenticated" }),
      };
    }

    const existingItem = await ddbDocClient.send(
        new GetCommand({
          TableName: process.env.TABLE_NAME,
          Key: { id: Number(gameId) },
        })
      );
      if (!existingItem.Item) {
        return {
          statusCode: 404,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: "Game not found" }),
        };
      }

      console.log("Stored userId in item:", existingItem.Item.userId);
  
      if (existingItem.Item.userId !== userId) {
        return {
          statusCode: 403,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: "Unauthorized update attempt" }),
        };
      }

    //const gameIdNumber = Number(gameId);

    const updateExpression = `SET ${Object.keys(body).map((key, i) => `#field${i} = :value${i}`).join(", ")}`;
    const expressionAttributeNames = Object.keys(body).reduce(
      (acc, key, i) => ({ ...acc, [`#field${i}`]: key }),
      {}
    );
    const expressionAttributeValues = Object.keys(body).reduce(
      (acc, key, i) => ({ ...acc, [`:value${i}`]: body[key] }),
      {}
    );

    const command = new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: { id: Number(gameId) },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    await ddbDocClient.send(command);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: `Game ${gameId} updated successfully` }),
    };
  } catch (error: any) {
    console.error("Error updating game:", JSON.stringify(error));
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message || error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = { convertEmptyValues: true, removeUndefinedValues: true, convertClassInstanceToMap: true };
  const unmarshallOptions = { wrapNumbers: false };
  return DynamoDBDocumentClient.from(ddbClient, { marshallOptions, unmarshallOptions });
}
