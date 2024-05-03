import { Controller, Get, Module } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';
import { client } from 'src/aws-config/dynamoDBClient';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

const { TABLE_NAME } = process.env;

class GetTeachersWithStudentsQuery {
  constructor() {}
}

@Controller()
class GetTeachersWithStudentsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('teachers')
  getStudentsList() {
    return this.queryBus.execute(new GetTeachersWithStudentsQuery());
  }
}

@QueryHandler(GetTeachersWithStudentsQuery)
class GetTeachersWithStudentsHandler
  implements IQueryHandler<GetTeachersWithStudentsQuery>
{
  async getTeachersWithStudents(): Promise<Record<string, any>[]> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'GSI1PK',
      },
      ExpressionAttributeValues: {
        ':pk': `TEACHER_INDEX`,
      },
    });

    try {
      const { Items = [] } = await client.send(command);
      return Items;
    } catch (error) {
      console.error('Unable to query the table. Error:', error);
      throw error;
    }
  }

  async execute() {
    const result = await this.getTeachersWithStudents();
    return result;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetTeachersWithStudentsController],
  providers: [GetTeachersWithStudentsHandler],
})
export class GetTeachersWithStudentsModule {}
