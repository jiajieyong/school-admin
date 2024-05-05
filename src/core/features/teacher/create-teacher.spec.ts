import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateTeacherCommand,
  CreateTeacherController,
  CreateTeacherHandler,
} from './create-teacher';
import { ITeachersResource } from 'src/core';
import { TeacherAlreadyExistsException } from '../../utils/exceptions';

const mockTeacherDTO = {
  name: 'Test',
  email: 'test@test.com',
};

describe('CreateTeacherCommand', () => {
  it('should create a CreateTeacherCommand instance', () => {
    const command = new CreateTeacherCommand(mockTeacherDTO);
    expect(command.createTeacherDto.name).toBe('Test');
    expect(command.createTeacherDto.email).toBe('test@test.com');
    expect(command instanceof CreateTeacherCommand).toBe(true);
  });
});

describe('CreateTeacherController', () => {
  let controller: CreateTeacherController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CreateTeacherController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: async () => 'Teacher created',
          },
        },
      ],
    }).compile();
    controller = app.get<CreateTeacherController>(CreateTeacherController);
  });

  describe('createTeacher', () => {
    it('should return "Teacher created"', async () => {
      expect(await controller.createTeacher(mockTeacherDTO)).toBe(
        'Teacher created',
      );
    });
  });
});

describe('CreateTeacherHandler', () => {
  let handler: CreateTeacherHandler;
  let teachersResourceMock: jest.Mocked<ITeachersResource>;

  beforeEach(() => {
    teachersResourceMock = {
      one: jest.fn(),
      addTeacher: jest.fn(),
      remove: jest.fn(),
    } as jest.Mocked<ITeachersResource>;
    handler = new CreateTeacherHandler(teachersResourceMock);
  });

  it('should add a new teacher when the teacher does not exist', async () => {
    teachersResourceMock.one.mockResolvedValueOnce(null);

    await handler.execute(new CreateTeacherCommand(mockTeacherDTO));

    expect(teachersResourceMock.one).toHaveBeenCalledWith('test@test.com');
    expect(teachersResourceMock.addTeacher).toHaveBeenCalledWith(
      mockTeacherDTO,
    );
  });

  it('throws a TeacherAlreadyExistsException when the teacher already exists', async () => {
    teachersResourceMock.one.mockResolvedValueOnce(mockTeacherDTO);

    await expect(
      handler.execute(new CreateTeacherCommand(mockTeacherDTO)),
    ).rejects.toThrow(new TeacherAlreadyExistsException(mockTeacherDTO.email));
  });
});
