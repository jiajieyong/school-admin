import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { dynamoDBClient } from '../aws-config/dynamoDBClient';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';

const { TABLE_NAME } = process.env;

export type Key = 'PK' | 'SK';
export type ItemKey = {
  [key in Key]: string;
};
export type PrimaryKey = string | { pk: string; sk: string };

@Injectable()
export class PersonService {
  async create(createPersonDto: CreateTeacherDto) {
    const pk = createPersonDto.email;
    const sk = createPersonDto.email;
    return await dynamoDBClient()
      .put({
        TableName: TABLE_NAME,
        Item: {
          PK: `TEACHER#${pk}`,
          SK: `TEACHER#${sk}`,
          name: createPersonDto.name,
          email: createPersonDto.email,
        },
      })
      .promise();
  }

  async findAll() {
    const results = await dynamoDBClient()
      .scan({
        TableName: TABLE_NAME,
      })
      .promise();

    return results.Items;
  }

  async findOne(personId: string) {
    const result = await dynamoDBClient()
      .get({
        TableName: TABLE_NAME,
        Key: { personId },
      })
      .promise();

    return result.Item;
  }

  async update(personId: string, updatePersonDto: UpdateTeacherDto) {
    const updated = await dynamoDBClient()
      .update({
        TableName: TABLE_NAME,
        Key: { personId },
        UpdateExpression: 'set #name = :name, email = :email',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':name': updatePersonDto.name,
          ':email': updatePersonDto.email,
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise();

    return updated.Attributes;
  }

  async remove(personId: string) {
    return await dynamoDBClient()
      .delete({
        TableName: TABLE_NAME,
        Key: { personId },
      })
      .promise();
  }
}
