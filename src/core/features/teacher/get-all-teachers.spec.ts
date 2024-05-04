import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  GetTeachersWithStudentsQuery,
  GetTeachersWithStudentsController,
  GetTeachersWithStudentsHandler,
} from './get-all-teachers';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

describe('GetTeachersWithStudentsQuery', () => {
  it('should create a GetTeachersWithStudentsQuery instance', () => {
    const command = new GetTeachersWithStudentsQuery();
    expect(command instanceof GetTeachersWithStudentsQuery).toBe(true);
  });
});

describe('GetTeachersWithStudentsController', () => {
  let controller: GetTeachersWithStudentsController;
  const mockResult = {
    teachers: [
      {
        email: 'test@test.com',
        students: ['stud1@test.com', 'stud2@test.com'],
      },
    ],
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GetTeachersWithStudentsController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: async () => mockResult,
          },
        },
      ],
    }).compile();
    controller = app.get<GetTeachersWithStudentsController>(
      GetTeachersWithStudentsController,
    );
  });

  describe('createTeacher', () => {
    it('should return "Teacher created"', async () => {
      expect(await controller.getStudentsList()).toBe(mockResult);
    });
  });
});

describe('GetTeachersWithStudentsHandler', () => {
  let handler: GetTeachersWithStudentsHandler;
  const ddbMock = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    ddbMock.reset();
    handler = new GetTeachersWithStudentsHandler();
  });

  describe('getAllTeachersEmail', () => {
    it('should return array of teacher emails', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [
          { email: 'teacher1@example.com' },
          { email: 'teacher2@example.com' },
        ],
      });

      const teacherEmails = await handler.getAllTeachersEmail();

      expect(teacherEmails).toEqual([
        'teacher1@example.com',
        'teacher2@example.com',
      ]);
    });

    it('should throw error if query fails', async () => {
      const error = new Error('Query failed');
      ddbMock.on(QueryCommand).rejects('Query failed');

      await expect(handler.getAllTeachersEmail()).rejects.toThrow(error);
    });
  });

  describe('listStudentsForTeachers', () => {
    it('should return array of teacher and their corresponding students under them', async () => {
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

      const listStudentsForTeachers = await handler.listStudentsForTeachers([
        'teacher1@example.com',
        'teacher2@example.com',
      ]);

      expect(listStudentsForTeachers).toEqual([
        {
          email: 'teacher1@example.com',
          students: ['student1@example.com', 'student2@example.com'],
        },
        {
          email: 'teacher2@example.com',
          students: ['student3@example.com', 'student4@example.com'],
        },
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
