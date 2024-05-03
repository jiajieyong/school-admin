import { Controller, Get, Module } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';
import { client } from 'src/aws-config/dynamoDBClient';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { TEACHER_ID_PREFIX } from '../../utils/constants';

const { TABLE_NAME } = process.env;
export interface ITeacher {
  email: string;
  students: string[];
}

export class GetTeachersWithStudentsQuery {
  constructor() {}
}

@Controller()
export class GetTeachersWithStudentsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('teachers')
  getStudentsList() {
    return this.queryBus.execute(new GetTeachersWithStudentsQuery());
  }
}

@QueryHandler(GetTeachersWithStudentsQuery)
export class GetTeachersWithStudentsHandler
  implements IQueryHandler<GetTeachersWithStudentsQuery>
{
  async getAllTeachersEmail(): Promise<string[]> {
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
      ProjectionExpression: 'email',
    });

    try {
      const { Items = [] } = await client.send(command);
      const teacherEmails: string[] = Items.map((item) => item.email);
      return teacherEmails;
    } catch (error) {
      console.error('Unable to query the table. Error:', error);
      throw error;
    }
  }

  async listStudentsForTeachers(teacherEmails: string[]): Promise<ITeacher[]> {
    const teacherwithStudentListCollection: ITeacher[] = [];
    for (const email of teacherEmails) {
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
        ExpressionAttributeNames: {
          '#pk': 'PK',
          '#sk': 'SK',
        },
        ExpressionAttributeValues: {
          ':pk': `${TEACHER_ID_PREFIX}${email}`,
          ':sk': `STUDENT#`,
        },
        ProjectionExpression: 'studentEmail',
      });

      try {
        const { Items = [] } = await client.send(command);
        const teacher: ITeacher = {
          email: email,
          students: Items.map((item) => item.studentEmail),
        };

        teacherwithStudentListCollection.push(teacher);
      } catch (error) {
        throw error;
      }
    }
    return teacherwithStudentListCollection;
  }

  async execute() {
    const teacherEmails = await this.getAllTeachersEmail();
    const result = await this.listStudentsForTeachers(teacherEmails);

    return { teachers: result };
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetTeachersWithStudentsController],
  providers: [GetTeachersWithStudentsHandler],
})
export class GetTeachersWithStudentsModule {}
