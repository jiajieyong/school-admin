import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ListStudentsForTeachersQuery,
  ListStudentsForTeachersController,
  ListStudentsForTeachersHandler,
} from './list-students-for-teachers';

describe('ListStudentsForTeachersQuery', () => {
  it('should create a GetTeachersWithStudentsQuery instance', () => {
    const command = new ListStudentsForTeachersQuery(['teacher@example.com']);
    expect(command instanceof ListStudentsForTeachersQuery).toBe(true);
  });
});

describe('ListStudentsForTeachersController', () => {
  let controller: ListStudentsForTeachersController;
  const mockResult = {
    students: ['stud1@test.com', 'stud2@test.com'],
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ListStudentsForTeachersController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: async () => mockResult,
          },
        },
      ],
    }).compile();
    controller = app.get<ListStudentsForTeachersController>(
      ListStudentsForTeachersController,
    );
  });

  describe('getStudentsList', () => {
    it('should return a list of common students between teachers', async () => {
      expect(
        await controller.getStudentsList([
          'teacher1@example.com',
          'teacher2@example.com',
        ]),
      ).toBe(mockResult);
    });
  });
});

describe('ListStudentsForTeachersHandler', () => {
  let handler: ListStudentsForTeachersHandler;
  const ddbMock = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    ddbMock.reset();
    handler = new ListStudentsForTeachersHandler();
  });

  describe('listStudentsForTeachers', () => {
    it('should return array of teacher emails', async () => {
      ddbMock
        .on(QueryCommand)
        .resolvesOnce({
          Items: [
            { studentEmail: 'student1@example.com' },
            { studentEmail: 'student2@example.com' },
          ],
        })
        .resolvesOnce({
          Items: [
            { studentEmail: 'student3@example.com' },
            { studentEmail: 'student4@example.com' },
          ],
        });

      const studentList = await handler.listStudentsForTeachers([
        'teacher1@example.com',
        'teacher2@example.com',
      ]);

      expect(studentList).toEqual([
        ['student1@example.com', 'student2@example.com'],
        ['student3@example.com', 'student4@example.com'],
      ]);
    });

    it('should throw error if query fails', async () => {
      const error = new Error('Query failed');
      ddbMock.on(QueryCommand).rejects('Query failed');

      await expect(
        handler.listStudentsForTeachers([
          'teacher1@example.com',
          'teacher2@example.com',
        ]),
      ).rejects.toThrow(error);
    });
  });
});

describe('execute', () => {
  let handler: ListStudentsForTeachersHandler;

  beforeEach(() => {
    handler = new ListStudentsForTeachersHandler();
  });

  it('should return a list of common students among teachers', async () => {
    handler.listStudentsForTeachers = jest.fn().mockResolvedValue([
      ['student1@example.com', 'student2@example.com', 'student3@example.com'],
      ['student2@example.com', 'student3@example.com', 'student4@example.com'],
    ]);
    const result = await handler.execute({
      teacherEmail: ['teacher1@example.com', 'teacher2@example.com'],
    });

    expect(result).toEqual({
      students: ['student2@example.com', 'student3@example.com'],
    });
    expect(handler.listStudentsForTeachers).toHaveBeenCalledTimes(1);
  });

  it('should return a list of students belonging to given teacher', async () => {
    handler.listStudentsForTeachers = jest
      .fn()
      .mockResolvedValue([
        [
          'student1@example.com',
          'student2@example.com',
          'student3@example.com',
        ],
      ]);
    const result = await handler.execute({
      teacherEmail: ['teacher1@example.com'],
    });

    expect(result).toEqual({
      students: [
        'student1@example.com',
        'student2@example.com',
        'student3@example.com',
        'student_only_under_teacher_teacher1@example.com',
      ],
    });
    expect(handler.listStudentsForTeachers).toHaveBeenCalledTimes(1);
  });

  it('should return NotFoundException when there are no common students', async () => {
    handler.listStudentsForTeachers = jest.fn().mockResolvedValue([
      ['student1@example.com', 'student2@example.com', 'student3@example.com'],
      ['student5@example.com', 'student6@example.com', 'student4@example.com'],
    ]);

    await expect(
      handler.execute({
        teacherEmail: ['teacher1@example.com', 'teacher2@example.com'],
      }),
    ).rejects.toThrow(
      'There are no common students among the list of teachers',
    );

    expect(handler.listStudentsForTeachers).toHaveBeenCalledTimes(1);
  });

  it('should return NotFoundException when there are no students under teacher', async () => {
    handler.listStudentsForTeachers = jest.fn().mockResolvedValue([[]]);

    await expect(
      handler.execute({
        teacherEmail: ['teacher1@example.com'],
      }),
    ).rejects.toThrow(
      'There are no students registered to teacher, Email teacher1@example.com',
    );

    expect(handler.listStudentsForTeachers).toHaveBeenCalledTimes(1);
  });
});
