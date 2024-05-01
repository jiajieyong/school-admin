import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

import { client } from '../../aws-config/dynamoDBClient';
const { TABLE_NAME } = process.env;

export type ID = { email: string };
export type Key = 'PK' | 'SK';
export type ItemKey = {
  [key in Key]: string;
};
export type PrimaryKey = string | { pk: string; sk: string };
export type DTO = any & ID;

export function IDENTITY<T>(value: T): T {
  return value;
}

interface CreateItem {
  dto: DTO;
  parentId?: string;
  decorator?: (obj: any) => any;
}

export interface IResource {
  create(createItem: CreateItem): Promise<string | undefined>;
}

interface CreateResource<T> {
  entityTemplate: { new (): T };
  pkPrefix: string;
  skPrefix?: string;
}

function projectionGenerator<T>(template: { new (): T }): {
  projectionExpression: string;
  projectionNames: Record<string, string>;
} {
  const shape = new template();
  const keys = Object.keys(shape).map((key) => `#${key}`);

  const projectionNames = Object.keys(shape).reduce(
    (acc: Record<string, string>, key: string, i: number) => {
      const transformedKey = keys[i];
      acc[transformedKey] = key;
      return acc;
    },
    {},
  );

  return {
    projectionExpression: keys.join(', '),
    projectionNames,
  };
}

export abstract class Resource<T extends Record<keyof T, any>>
  implements IResource
{
  protected readonly client: DynamoDBDocumentClient = client;
  protected readonly tableName: string = TABLE_NAME;
  private entityTemplate: { new (): T };
  private pkPrefix: string;
  skPrefix: string;

  constructor({
    entityTemplate,
    pkPrefix,
    skPrefix = pkPrefix,
  }: CreateResource<T>) {
    this.entityTemplate = entityTemplate;
    this.pkPrefix = pkPrefix;
    this.skPrefix = skPrefix;
  }

  private generateItemKey(pk: string, sk: string = pk): ItemKey {
    return {
      PK: `${this.pkPrefix}${pk}`,
      SK: `${this.skPrefix}${sk}`,
    };
  }

  private stripSkPrefix(sk: string): string {
    return sk.substring(this.skPrefix.length);
  }

  async create({
    decorator = IDENTITY,
    dto,
    parentId,
  }: CreateItem): Promise<string | undefined> {
    const createdAt = new Date();
    const pk = parentId || dto.email;
    const sk = dto.email;
    const primaryKey = this.generateItemKey(pk, sk);
    const item = decorator.call(this, { ...primaryKey, ...dto, createdAt });

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });
    await this.client.send(command);
    return item.id;
  }

  async one(...args: [string, string?]): Promise<T | undefined> {
    const { projectionExpression, projectionNames } = projectionGenerator(
      this.entityTemplate,
    );
    const key = this.generateItemKey(...args);
    const command = new GetCommand({
      TableName: this.tableName,
      Key: key,
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: projectionNames,
    });
    const { Item } = await this.client.send(command);

    if (!Item) {
      return undefined;
    }

    return Item as T;
  }

  async remove(...args: [string, string?]): Promise<any> {
    const key = this.generateItemKey(...args);
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: key,
    });
    const result = await this.client.send(command);
    return result;
  }
}
