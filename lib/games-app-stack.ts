import * as cdk from 'aws-cdk-lib';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { generateBatch } from "../shared/util";
import {games, gameDevelopers} from "../seed/games";

import { Construct } from 'constructs';
import { get } from 'http';

export class GamesAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const gamesFn = new lambdanode.NodejsFunction(this, "GamesFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/games.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
    });

    const gamesFnURL = gamesFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    const gamesTable = new dynamodb.Table(this, "GamesTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Games",
    });

    const gameDevelopersTable = new dynamodb.Table(this, "GameDeveloperTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "gameId", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "developerName", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "GameDeveloper",
 });

    gameDevelopersTable.addLocalSecondaryIndex({
      indexName: "roleIx",
      sortKey: { name: "roleName", type: dynamodb.AttributeType.STRING },
 });

    new custom.AwsCustomResource(this, "gamesddbInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [gamesTable.tableName]: generateBatch(games),
            [gameDevelopersTable.tableName]: generateBatch(gameDevelopers),
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("gamesddbInitData"), //.of(Date.now().toString()),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [gamesTable.tableArn, gameDevelopersTable.tableArn],
      }),
    });

    const getGameByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetGameByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getGameById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: gamesTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    const getGameByIdURL = getGameByIdFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    const getAllGamesFn = new lambdanode.NodejsFunction(
      this,
      "GetAllGamesFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getAllGames.ts`, 
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: gamesTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    const getAllGamesURL = getAllGamesFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    const getGameDevelopersFn = new lambdanode.NodejsFunction(
      this,
      "GetGameDeveloperFn",
 {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getGameDevelopers.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          DEVELOPERS_TABLE_NAME: gameDevelopersTable.tableName,
          REGION: "eu-west-1",
 },
 }
 );

    const getGameDevelopersURL = getGameDevelopersFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
 },
 });    

    gamesTable.grantReadData(getGameByIdFn);
    gamesTable.grantReadData(getAllGamesFn);
    gameDevelopersTable.grantReadData(getGameDevelopersFn);
    gamesTable.grantReadData(getGameDevelopersFn);
  

    new cdk.CfnOutput(this, "Games Function Url", { value: gamesFnURL.url });
    new cdk.CfnOutput(this, "Get Game Function Url", { value: getGameByIdURL.url });
    new cdk.CfnOutput(this, "Get All Games Function Url", { value: getAllGamesURL.url });
    new cdk.CfnOutput(this, "Get Game Developers Function Url", { value: getGameDevelopersURL.url });
  }
}

