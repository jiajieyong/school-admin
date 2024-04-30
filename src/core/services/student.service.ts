import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import 'dotenv/config';
import { dynamoDBClient } from '../../aws-config/dynamoDBClient';
import { CreateStudentDto, UpdateStudentDto } from 'src/core';

const { TABLE_NAME } = process.env;

@Injectable()
export class StudentService {
  private studentPrefix = 'STUDENT#';

  async create(createStudentDto: CreateStudentDto) {
    const pk = createStudentDto.email;
    const sk = createStudentDto.email;
    return await dynamoDBClient()
      .put({
        TableName: TABLE_NAME,
        Item: {
          PK: this.studentPrefix.concat(pk),
          SK: this.studentPrefix.concat(sk),
          name: createStudentDto.name,
          email: createStudentDto.email,
        },
      })
      .promise();
  }

  async findOne(email: string) {
    let student: object;

    try {
      const result = await dynamoDBClient()
        .get({
          TableName: TABLE_NAME,
          Key: {
            PK: this.studentPrefix.concat(email),
            SK: this.studentPrefix.concat(email),
          },
        })
        .promise();

      student = result.Item;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    if (!student) {
      throw new NotFoundException(`Student with email ${email} not found`);
    }

    return student;
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
