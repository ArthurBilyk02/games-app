import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
  GetCommand,
  GetCommandInput
    
} from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));
    const queryParams = event.queryStringParameters;
    if (!queryParams) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
 },
        body: JSON.stringify({ message: "Missing query parameters" }),
 };
 }
    if (!queryParams.gameId) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
 },
        body: JSON.stringify({ message: "Missing game Id parameter" }),
 };
 }
    const gameId = parseInt(queryParams?.gameId);
    const facts = queryParams.facts === "true";

    let commandInput: QueryCommandInput = {
      TableName: process.env.DEVELOPERS_TABLE_NAME,
      KeyConditionExpression: "gameId = :g",
      ExpressionAttributeValues: { ":g": gameId },
 };
    if ("roleName" in queryParams) {
      commandInput = {
 ...commandInput,
        IndexName: "roleIx",
        KeyConditionExpression: "gameId = :g and begins_with(roleName, :r) ",
        ExpressionAttributeValues: {
          ":g": gameId,
          ":r": queryParams.roleName,
 },
 };
 } else if ("developerName" in queryParams) {
      commandInput = {
 ...commandInput,
        KeyConditionExpression: "gameId = :g and begins_with(developerName, :d) ",
        ExpressionAttributeValues: {
          ":g": gameId,
          ":d": queryParams.developerName,
 },
 };
 } else {
      commandInput = {
 ...commandInput,
        KeyConditionExpression: "gameId = :g",
        ExpressionAttributeValues: {
          ":g": gameId,
 },
 };
 }

    const commandOutput = await ddbDocClient.send(
      new QueryCommand(commandInput)
 );
    const developersData = commandOutput.Items;

    let gameData: Record<string, any> | undefined = undefined;
    if (facts) {
        const gameCommandInput: GetCommandInput = {
        TableName: process.env.GAMES_TABLE_NAME,
        Key: { id: gameId },
        ProjectionExpression: "title, genre_ids, description",
      };

    const gameCommandOutput = await ddbDocClient.send(new GetCommand(gameCommandInput));
    gameData = gameCommandOutput.Item;
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
 },
      body: JSON.stringify({
        game: facts ? gameData : undefined,
        developers: developersData,
 }),
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

function createDocumentClient() {
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