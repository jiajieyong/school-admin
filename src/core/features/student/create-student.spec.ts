import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateStudentCommand,
  CreateStudentController,
  CreateStudentHandler,
} from './create-student';
import { IStudentsResource } from 'src/core';
import { StudentAlreadyExistsException } from '../../utils/exceptions';

const mockStudentDTO = {
  name: 'Test',
  email: 'test@test.com',
};

describe('CreateStudentCommand', () => {
  it('should create a CreateStudentCommand instance', () => {
    const command = new CreateStudentCommand(mockStudentDTO);
    expect(command.createStudentDto.name).toBe('Test');
    expect(command.createStudentDto.email).toBe('test@test.com');
    expect(command instanceof CreateStudentCommand).toBe(true);
  });
});

describe('CreateStudentController', () => {
  let controller: CreateStudentController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CreateStudentController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: async () => 'Student created',
          },
        },
      ],
    }).compile();
    controller = app.get<CreateStudentController>(CreateStudentController);
  });

  describe('createStudent', () => {
    it('should return "Student created"', async () => {
      expect(await controller.createStudent(mockStudentDTO)).toBe(
        'Student created',
      );
    });
  });
});

describe('CreateStudentHandler', () => {
  let handler: CreateStudentHandler;
  let studentsResourceMock: jest.Mocked<IStudentsResource>;

  beforeEach(() => {
    studentsResourceMock = {
      one: jest.fn(),
      addStudent: jest.fn(),
      remove: jest.fn(),
    } as jest.Mocked<IStudentsResource>;
    handler = new CreateStudentHandler(studentsResourceMock);
  });

  it('should add a new student when the student does not exist', async () => {
    studentsResourceMock.one.mockResolvedValueOnce(null);

    await handler.execute(new CreateStudentCommand(mockStudentDTO));

    expect(studentsResourceMock.one).toHaveBeenCalledWith('test@test.com');
    expect(studentsResourceMock.addStudent).toHaveBeenCalledWith(
      mockStudentDTO,
    );
  });

  it('throws a StudentAlreadyExistsException when the student already exists', async () => {
    studentsResourceMock.one.mockResolvedValueOnce(mockStudentDTO);

    await expect(
      handler.execute(new CreateStudentCommand(mockStudentDTO)),
    ).rejects.toThrow(new StudentAlreadyExistsException(mockStudentDTO.email));
  });
});
