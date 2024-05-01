import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import 'dotenv/config';

const { ENDPOINT_URL, REGION } = process.env;

export const dynamoDBClient = (): DocumentClient => {
  return new AWS.DynamoDB.DocumentClient({
    region: REGION,
    endpoint: ENDPOINT_URL,
  });
};

const dynamoClient = new DynamoDBClient({
  region: REGION,
  endpoint: ENDPOINT_URL,
});

export const client = DynamoDBDocumentClient.from(dynamoClient);
export const DATA_TABLE = 'data';
