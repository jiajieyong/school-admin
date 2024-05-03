import { Controller, Get, Module } from '@nestjs/common';
import {
  CqrsModule,
  IQueryHandler,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';
import { client } from 'src/aws-config/dynamoDBClient';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { STUDENT_ID_PREFIX } from '../../utils/constants';

const { TABLE_NAME } = process.env;

interface IStudent {
  email: string;
  teachers: string[];
}

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
  async getAllStudentsEmail(): Promise<string[]> {
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
      ProjectionExpression: 'email',
    });

    try {
      const { Items = [] } = await client.send(command);
      const studentEmails: string[] = Items.map((item) => item.email);
      return studentEmails;
    } catch (error) {
      console.error('Unable to query the table. Error:', error);
      throw error;
    }
  }

  async listTeachersForStudents(studentEmails: string[]): Promise<IStudent[]> {
    const teacherwithStudentListCollection: IStudent[] = [];
    for (const email of studentEmails) {
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
        ExpressionAttributeNames: {
          '#pk': 'GSI1PK',
          '#sk': 'GSI1SK',
        },
        ExpressionAttributeValues: {
          ':pk': `${STUDENT_ID_PREFIX}${email}`,
          ':sk': `TEACHER#`,
        },
        ProjectionExpression: 'teacherEmail',
      });

      try {
        const { Items = [] } = await client.send(command);
        const student: IStudent = {
          email: email,
          teachers: Items.map((item) => item.teacherEmail),
        };

        teacherwithStudentListCollection.push(student);
      } catch (error) {
        console.error('Unable to query the table. Error:', error);
        throw error;
      }
    }
    return teacherwithStudentListCollection;
  }

  async execute() {
    const studentEmails = await this.getAllStudentsEmail();
    const result = await this.listTeachersForStudents(studentEmails);

    return { students: result };
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [GetStudentsWithTeachersController],
  providers: [GetStudentsWithTeachersHandler],
})
export class GetStudentsWithTeachersModule {}
