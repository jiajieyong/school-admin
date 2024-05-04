import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ListStudentsForTeachersQuery,
  ListStudentsForTeachersController,
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
