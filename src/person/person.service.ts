import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { dynamoDBClient } from '../aws-config/dynamoDBClient';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

const { TABLE_NAME } = process.env;

@Injectable()
export class PersonService {
  async create(createPersonDto: CreatePersonDto, personType) {
    return await dynamoDBClient()
      .put({
        TableName: TABLE_NAME,
        Item: {
          personId: `${personType}#${createPersonDto.email}`,
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

  async update(personId: string, updatePersonDto: UpdatePersonDto) {
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
