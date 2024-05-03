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

class GetStudentsWithTeachersQuery {
  constructor() {}
}

@Controller()
class GetStudentsWithTeachersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('Students')
  getTeachersList() {
    return this.queryBus.execute(new GetStudentsWithTeachersQuery());
  }
}

@QueryHandler(GetStudentsWithTeachersQuery)
class GetStudentsWithTeachersHandler
  implements IQueryHandler<GetStudentsWithTeachersQuery>
{
  async getStudentsWithTeachers(): Promise<Record<string, any>[]> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'GSI1PK',
      },
      ExpressionAttributeValues: {
        ':pk': `STUDENT_INDEX`,
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
    const result = await this.getStudentsWithTeachers();
    return result;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetStudentsWithTeachersController],
  providers: [GetStudentsWithTeachersHandler],
})
export class GetStudentsWithTeachersModule {}
