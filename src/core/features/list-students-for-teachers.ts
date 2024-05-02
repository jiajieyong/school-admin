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
import { projectionGenerator } from '../utils/resource';
import { TEACHER_ID_PREFIX, STUDENT_ID_PREFIX } from '../utils/constants';
import { TeacherStudent } from 'src/core';

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
  ): Promise<TeacherStudent[]> {
    const PK = `${TEACHER_ID_PREFIX}${teacherEmail}`;
    const SK = `${STUDENT_ID_PREFIX}john@gmail.com`;
    const { projectionExpression, projectionNames } =
      projectionGenerator(TeacherStudent);

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: '#pk = :pk AND #sk = :sk',
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#sk': 'SK',
        ...projectionNames,
      },
      ExpressionAttributeValues: {
        ':pk': PK,
        ':sk': SK,
      },
    });

    try {
      const { Items = [] } = await client.send(command);
      return Items as TeacherStudent[];
    } catch (error) {
      console.error('Unable to query the table. Error:', error);
      throw error;
    }
  }

  async execute({ teacherEmail }: ListStudentsForTeachersQuery) {
    const teachersWithStudents =
      await this.listStudentsForTeachers(teacherEmail);

    if (teachersWithStudents.length === 0) {
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
