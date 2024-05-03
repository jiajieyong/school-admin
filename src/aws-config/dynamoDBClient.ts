import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import 'dotenv/config';

const { ENDPOINT_URL, REGION } = process.env;

const dynamoClient = new DynamoDBClient({
  region: REGION,
  endpoint: ENDPOINT_URL,
});

export const client = DynamoDBDocumentClient.from(dynamoClient);
export const DATA_TABLE = 'data';
