import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import 'dotenv/config';
import { dynamoDBClient } from '../../aws-config/dynamoDBClient';
import { CreateTeacherDto, UpdateTeacherDto } from 'src/core';

const { TABLE_NAME } = process.env;

@Injectable()
export class TeacherService {
  private teacherPrefix = 'TEACHER#';

  async create(createTeacherDto: CreateTeacherDto) {
    const pk = createTeacherDto.email;
    const sk = createTeacherDto.email;
    return await dynamoDBClient()
      .put({
        TableName: TABLE_NAME,
        Item: {
          PK: this.teacherPrefix.concat(pk),
          SK: this.teacherPrefix.concat(sk),
          name: createTeacherDto.name,
          email: createTeacherDto.email,
        },
      })
      .promise();
  }

  async findOne(email: string) {
    let teacher: object;

    try {
      const result = await dynamoDBClient()
        .get({
          TableName: TABLE_NAME,
          Key: {
            PK: this.teacherPrefix.concat(email),
            SK: this.teacherPrefix.concat(email),
          },
        })
        .promise();

      teacher = result.Item;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    if (!teacher) {
      throw new NotFoundException(`Teacher with email ${email} not found`);
    }

    return teacher;
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
