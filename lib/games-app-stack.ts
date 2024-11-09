import * as cdk from 'aws-cdk-lib';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { generateBatch } from "../shared/util";
import {games, gameDevelopers} from "../seed/games";
import * as apig from "aws-cdk-lib/aws-apigateway";
import { Construct } from 'constructs';
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as path from 'path';

export class GamesAppStack extends cdk.Stack {
  private auth: apig.IResource;
  public userPoolId: string;
  public userPoolClientId: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { username: true },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    this.userPoolId = userPool.userPoolId;
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
    });
    this.userPoolClientId = userPoolClient.userPoolClientId;

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
          DEVELOPERS_TABLE_NAME: gameDevelopersTable.tableName,
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
          GAMES_TABLE_NAME: gamesTable.tableName,
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

 const newGameFn = new lambdanode.NodejsFunction(this, "AddGameFn", {
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_18_X,
  entry: `${__dirname}/../lambdas/addGame.ts`,
  timeout: cdk.Duration.seconds(10),
  memorySize: 128,
  environment: {
    TABLE_NAME: gamesTable.tableName,
    REGION: "eu-west-1",
  },
});

const deleteGameFn = new lambdanode.NodejsFunction(this, "DeleteGameFn", {
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_18_X,
  entry: `${__dirname}/../lambdas/deleteGame.ts`,
  timeout: cdk.Duration.seconds(10),
  memorySize: 128,
  environment: {
    TABLE_NAME: gamesTable.tableName,
    REGION: "eu-west-1",
  },
});


    gamesTable.grantReadData(getGameByIdFn);
    gamesTable.grantReadData(getAllGamesFn);
    gameDevelopersTable.grantReadData(getGameDevelopersFn);
    gameDevelopersTable.grantReadData(getGameByIdFn);
    gamesTable.grantReadData(getGameDevelopersFn);
    gamesTable.grantReadWriteData(newGameFn);
    gamesTable.grantWriteData(deleteGameFn);
  

    // new cdk.CfnOutput(this, "Games Function Url", { value: gamesFnURL.url });
    // new cdk.CfnOutput(this, "Get Game Function Url", { value: getGameByIdURL.url });
    // new cdk.CfnOutput(this, "Get All Games Function Url", { value: getAllGamesURL.url });
    // new cdk.CfnOutput(this, "Get Game Developers Function Url", { value: getGameDevelopersURL.url });

  const api = new apig.RestApi(this, "GameAPI", {
    description: "Game App API",
    deployOptions: {
      stageName: "dev",
    },
    defaultCorsPreflightOptions: {
      allowHeaders: ["Content-Type", "X-Amz-Date"],
      allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
      allowCredentials: true,
      allowOrigins: ["*"],
    },
  });

  this.auth = api.root.addResource("auth");
  this.addAuthRoute(
    "signup",
    "POST",
    "SignupFn",
    path.join(__dirname, '../lambdas/auth/signup.ts')
  );
  this.addAuthRoute(
    "confirm_signup",
    "POST",
    "ConfirmFn",
    path.join(__dirname, '../lambdas/auth/confirm-signup.ts')
  );

  const gamesEndpoint = api.root.addResource("games");
  gamesEndpoint.addMethod(
    "GET",
    new apig.LambdaIntegration(getAllGamesFn, { proxy: true })
  );

  const gameEndpoint = gamesEndpoint.addResource("{gameId}");
  gameEndpoint.addMethod(
    "GET",
    new apig.LambdaIntegration(getGameByIdFn, { proxy: true })
  );

  const gameDeveloperEndpoint = gamesEndpoint.addResource("developers");
gameDeveloperEndpoint.addMethod(
    "GET",
    new apig.LambdaIntegration(getGameDevelopersFn, { proxy: true })
);

  gamesEndpoint.addMethod(
    "POST",
    new apig.LambdaIntegration(newGameFn, { proxy: true })
  );

  gameEndpoint.addMethod(
    "DELETE",
    new apig.LambdaIntegration(deleteGameFn, { proxy: true })
  );

  new cdk.CfnOutput(this, "API Gateway URL", { value: api.url });
}

private addAuthRoute(
  resourceName: string,
  method: string,
  fnName: string,
  fnEntry: string,
  allowCognitoAccess?: boolean
): void {
  const commonFnProps = {
    architecture: lambda.Architecture.ARM_64,
    timeout: cdk.Duration.seconds(10),
    memorySize: 128,
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: "handler",
    environment: {
      USER_POOL_ID: this.userPoolId,
      CLIENT_ID: this.userPoolClientId,
      REGION: cdk.Aws.REGION
    },
  };

  const resource = this.auth.addResource(resourceName);

  const fn = new lambdanode.NodejsFunction(this, fnName, {
    ...commonFnProps,
    entry: fnEntry,
  });

  resource.addMethod(method, new apig.LambdaIntegration(fn));
}
}

