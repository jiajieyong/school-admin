import {
  Controller,
  Get,
  Module,
  Query,
  NotFoundException,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  IQueryHandler,
  QueryHandler,
  QueryBus,
  CqrsModule,
} from '@nestjs/cqrs';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { client } from 'src/aws-config/dynamoDBClient';
import { TEACHER_ID_PREFIX } from '../../utils/constants';

const { TABLE_NAME } = process.env;
class ListStudentsForTeachersQuery {
  constructor(public readonly teacherEmail: string[]) {}
}

@Controller()
class ListStudentsForTeachersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('commonstudents')
  getStudentsList(
    @Query('teacher', new ParseArrayPipe({ items: String })) teacher: string[],
  ) {
    return this.queryBus.execute(new ListStudentsForTeachersQuery(teacher));
  }
}

@QueryHandler(ListStudentsForTeachersQuery)
class ListStudentsForTeachersHandler
  implements IQueryHandler<ListStudentsForTeachersQuery>
{
  async listStudentsForTeachers(teacherEmails: string[]): Promise<string[][]> {
    const studentListCollection: string[][] = [];
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
        const listOfStudent: string[] = Items.map((item) => item.studentEmail);
        studentListCollection.push(listOfStudent);
      } catch (error) {
        console.error('Unable to query the table. Error:', error);
        throw error;
      }
    }
    return studentListCollection;
  }

  async execute({ teacherEmail }: ListStudentsForTeachersQuery) {
    const studentListCollection =
      await this.listStudentsForTeachers(teacherEmail);

    const commonStudents = studentListCollection.reduce((acc, currArray) => {
      return acc.filter((value) => currArray.includes(value));
    });

    if (commonStudents.length === 0 && teacherEmail.length > 1) {
      throw new NotFoundException(
        `There are no common students among the list of teachers`,
      );
    }

    if (commonStudents.length === 0 && teacherEmail.length === 1) {
      throw new NotFoundException(
        `There are no students registered to teacher, Email ${teacherEmail[0]}`,
      );
    }

    if (studentListCollection.length === 1 && teacherEmail.length === 1) {
      commonStudents.push(`student_only_under_teacher_${teacherEmail[0]}`);
    }
    return { students: commonStudents };
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [ListStudentsForTeachersController],
  providers: [ListStudentsForTeachersHandler],
})
export class ListStudentsForTeachersModule {}
