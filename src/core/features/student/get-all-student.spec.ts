import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  GetStudentsWithTeachersQuery,
  GetStudentsWithTeachersController,
  GetStudentsWithTeachersHandler,
} from './get-all-students';

describe('GetStudentsWithTeachersQuery', () => {
  it('should create a GetStudentsWithTeachersQuery instance', () => {
    const command = new GetStudentsWithTeachersQuery();
    expect(command instanceof GetStudentsWithTeachersQuery).toBe(true);
  });
});

describe('GetStudentsWithTeachersController', () => {
  let controller: GetStudentsWithTeachersController;
  const mockResult = {
    students: [
      {
        email: 'student@test.com',
        teachers: ['teacher1@test.com', 'teacher2@test.com'],
      },
    ],
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GetStudentsWithTeachersController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: async () => mockResult,
          },
        },
      ],
    }).compile();
    controller = app.get<GetStudentsWithTeachersController>(
      GetStudentsWithTeachersController,
    );
  });

  describe('getTeachersList', () => {
    it('should return a list of students with teachers they are assigned to', async () => {
      expect(await controller.getTeachersList()).toBe(mockResult);
    });
  });
});

describe('GetStudentsWithTeachersHandler', () => {
  let handler: GetStudentsWithTeachersHandler;
  const ddbMock = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    ddbMock.reset();
    handler = new GetStudentsWithTeachersHandler();
  });

  describe('getAllStudentsEmail', () => {
    it('should return array of student emails', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [
          { email: 'student1@example.com' },
          { email: 'student2@example.com' },
        ],
      });

      const studentEmails = await handler.getAllStudentsEmail();

      expect(studentEmails).toEqual([
        'student1@example.com',
        'student2@example.com',
      ]);
    });

    it('should throw error if query fails', async () => {
      const error = new Error('Query failed');
      ddbMock.on(QueryCommand).rejects('Query failed');

      await expect(handler.getAllStudentsEmail()).rejects.toThrow(error);
    });
  });

  describe('listTeachersForStudents', () => {
    it('should return array of student and their corresponding teachers they are under', async () => {
      ddbMock
        .on(QueryCommand)
        .resolvesOnce({
          Items: [
            { teacherEmail: 'teacher1@example.com' },
            { teacherEmail: 'teacher2@example.com' },
          ],
        })
        .resolvesOnce({
          Items: [
            { teacherEmail: 'teacher3@example.com' },
            { teacherEmail: 'teacher4@example.com' },
          ],
        });

      const listTeachersForStudents = await handler.listTeachersForStudents([
        'student1@example.com',
        'student2@example.com',
      ]);

      expect(listTeachersForStudents).toEqual([
        {
          email: 'student1@example.com',
          teachers: ['teacher1@example.com', 'teacher2@example.com'],
        },
        {
          email: 'student2@example.com',
          teachers: ['teacher3@example.com', 'teacher4@example.com'],
        },
      ]);
    });

    it('should throw error if query fails', async () => {
      const error = new Error('Query failed');
      ddbMock.on(QueryCommand).rejects('Query failed');

      await expect(
        handler.listTeachersForStudents([
          'student1@example.com',
          'student2@example.com',
        ]),
      ).rejects.toThrow(error);
    });
  });
});
