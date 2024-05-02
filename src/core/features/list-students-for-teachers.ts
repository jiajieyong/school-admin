import {
  Controller,
  Get,
  Module,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { client } from 'src/aws-config/dynamoDBClient';
import { TEACHER_ID_PREFIX } from '../utils/constants';

const { TABLE_NAME } = process.env;

class ListStudentsForTeachersQuery {
  constructor(public readonly teacherEmail: string) {}
}

@Controller()
class ListStudentsForTeachersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('commonstudents/:teacher')
  getStudentsList(@Param('teacher') teacher: string) {
    return this.queryBus.execute(new ListStudentsForTeachersQuery(teacher));
  }
}

@QueryHandler(ListStudentsForTeachersQuery)
class ListStudentsForTeachersHandler
  implements IQueryHandler<ListStudentsForTeachersQuery>
{
  async listStudentsForTeachers(
    teacherEmail: string,
  ): Promise<{ students: string[] }> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#sk': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': `${TEACHER_ID_PREFIX}${teacherEmail}`,
        ':sk': `STUDENT#`,
      },
      ProjectionExpression: 'studentEmail',
    });

    try {
      const { Items = [] } = await client.send(command);
      const listOfStudent = {
        students: Items.map((item) => item.studentEmail),
      };
      return listOfStudent;
    } catch (error) {
      console.error('Unable to query the table. Error:', error);
      throw error;
    }
  }

  async execute({ teacherEmail }: ListStudentsForTeachersQuery) {
    const teachersWithStudents =
      await this.listStudentsForTeachers(teacherEmail);

    if (teachersWithStudents.students.length === 0) {
      throw new NotFoundException(`No teachers with any students found`);
    }
    return teachersWithStudents;
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListStudentsForTeachersController],
  providers: [ListStudentsForTeachersHandler],
})
export class ListStudentsForTeachersModule {}
