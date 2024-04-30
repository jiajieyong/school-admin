import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { dynamoDBClient } from '../../aws-config/dynamoDBClient';
import { CreateTeacherDto, UpdateTeacherDto } from 'src/core';

const { TABLE_NAME } = process.env;

@Injectable()
export class TeacherService {
  async create(createTeacherDto: CreateTeacherDto) {
    const pk = createTeacherDto.email;
    const sk = createTeacherDto.email;
    return await dynamoDBClient()
      .put({
        TableName: TABLE_NAME,
        Item: {
          PK: `TEACHER#${pk}`,
          SK: `TEACHER#${sk}`,
          name: createTeacherDto.name,
          email: createTeacherDto.email,
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

  async update(personId: string, updateTeacherDto: UpdateTeacherDto) {
    const updated = await dynamoDBClient()
      .update({
        TableName: TABLE_NAME,
        Key: { personId },
        UpdateExpression: 'set #name = :name, email = :email',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':name': updateTeacherDto.name,
          ':email': updateTeacherDto.email,
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
