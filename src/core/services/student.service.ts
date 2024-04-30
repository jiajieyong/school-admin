import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { dynamoDBClient } from '../../aws-config/dynamoDBClient';
import { CreateStudentDto, UpdateStudentDto } from 'src/core';

const { TABLE_NAME } = process.env;

@Injectable()
export class StudentService {
  async create(createStudentDto: CreateStudentDto) {
    const pk = createStudentDto.email;
    const sk = createStudentDto.email;
    return await dynamoDBClient()
      .put({
        TableName: TABLE_NAME,
        Item: {
          PK: `STUDENT#${pk}`,
          SK: `STUDENT#${sk}`,
          name: createStudentDto.name,
          email: createStudentDto.email,
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

  async update(personId: string, updateStudentDto: UpdateStudentDto) {
    const updated = await dynamoDBClient()
      .update({
        TableName: TABLE_NAME,
        Key: { personId },
        UpdateExpression: 'set #name = :name, email = :email',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':name': updateStudentDto.name,
          ':email': updateStudentDto.email,
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
