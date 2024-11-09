import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));
const translateClient = new TranslateClient({ region: process.env.REGION });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const { gameId, language } = event.pathParameters || {};
    if (!gameId || !language) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required parameters: gameId or language" }),
      };
    }

    const item = await dynamoClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id: Number(gameId) },
      })
    );

    if (!item.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    const translatableAttributes = ["description", "name"];
    let isNewTranslation = false;
    const updateExpression: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    for (const attr of translatableAttributes) {
      const translatedAttr = `${attr}_${language}`;
      
      if (!item.Item[translatedAttr] && item.Item[attr]) {
        const translateCommand = new TranslateTextCommand({
          Text: item.Item[attr],
          SourceLanguageCode: "en",
          TargetLanguageCode: language,
        });
        const { TranslatedText } = await translateClient.send(translateCommand);
        
        item.Item[translatedAttr] = TranslatedText;
        isNewTranslation = true;

        updateExpression.push(`#${translatedAttr} = :${translatedAttr}`);
        expressionAttributeNames[`#${translatedAttr}`] = translatedAttr;
        expressionAttributeValues[`:${translatedAttr}`] = TranslatedText;
      }
    }

    if (isNewTranslation) {
      await dynamoClient.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: { id: Number(gameId) },
          UpdateExpression: `SET ${updateExpression.join(", ")}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        })
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify(item.Item),
    };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error processing translation request", error: error.message || error }),
    };
  }
};
