import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  GetTeachersWithStudentsQuery,
  GetTeachersWithStudentsController,
  GetTeachersWithStudentsHandler,
} from './get-all-teachers';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { client } from 'src/aws-config/dynamoDBClient';

const { TABLE_NAME } = process.env;

const mockResult = {
  teachers: [
    {
      email: 'test@test.com',
      students: ['stud1@test.com', 'stud2@test.com'],
    },
  ],
};

describe('GetTeachersWithStudentsQuery', () => {
  it('should create a GetTeachersWithStudentsQuery instance', () => {
    const command = new GetTeachersWithStudentsQuery();
    expect(command instanceof GetTeachersWithStudentsQuery).toBe(true);
  });
});

describe('GetTeachersWithStudentsController', () => {
  let controller: GetTeachersWithStudentsController;

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

describe('GetTeachersWithStudentsHandler - getAllTeachersEmail', () => {
  let handler: GetTeachersWithStudentsHandler;
  let sendMock: jest.Mock;

  beforeEach(() => {
    sendMock = jest.fn().mockResolvedValue({
      Items: [
        { email: 'teacher1@example.com' },
        { email: 'teacher2@example.com' },
      ],
    });

    client.send = sendMock;

    handler = new GetTeachersWithStudentsHandler();
  });

  it('should return array of teacher emails', async () => {
    const teacherEmails = await handler.getAllTeachersEmail();

    expect(teacherEmails).toEqual([
      'teacher1@example.com',
      'teacher2@example.com',
    ]);
    expect(sendMock).toHaveBeenCalledTimes(1); // Ensure one query was made
  });

  it('should throw error if query fails', async () => {
    const error = new Error('Query failed');
    sendMock.mockRejectedValue(error);

    await expect(handler.getAllTeachersEmail()).rejects.toThrow(error);
    expect(sendMock).toHaveBeenCalledTimes(1); // Ensure one query was made
  });
});
