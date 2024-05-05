import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  RegisterStudentsToTeacherCommand,
  RegisterStudentToTeacherController,
  RegisterStudentToTeacherHandler,
} from './register-student-to-teacher';
import {
  ITeachersResource,
  IStudentsResource,
  ITeacherStudentsResource,
} from 'src/core';
import {
  StudentAlreadyAssignedException,
  StudentNotFoundException,
  TeacherNotFoundException,
} from '../../utils/exceptions';

const mockTeacherStudentDTO = {
  teacher: 'test@example.com',
  students: ['student1@example.com'],
};

const mockTeacherDTO = {
  name: 'Test',
  email: 'test@example.com',
};

const mockStudentDTO = {
  name: 'stud',
  email: 'student1@example.com',
};

describe('RegisterStudentsToTeacherCommand', () => {
  it('should create a RegisterStudentsToTeacherCommand instance', () => {
    const command = new RegisterStudentsToTeacherCommand(mockTeacherStudentDTO);
    expect(command.registerStudentDto.teacher).toBe('test@example.com');
    expect(command.registerStudentDto.students).toEqual([
      'student1@example.com',
    ]);
    expect(command instanceof RegisterStudentsToTeacherCommand).toBe(true);
  });
});

describe('RegisterStudentToTeacherController', () => {
  let controller: RegisterStudentToTeacherController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RegisterStudentToTeacherController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: async () => 'Student registered to teacher',
          },
        },
      ],
    }).compile();
    controller = app.get<RegisterStudentToTeacherController>(
      RegisterStudentToTeacherController,
    );
  });

  describe('addStudentToTeacher', () => {
    it('should return "Student registered to teacher"', async () => {
      expect(await controller.addStudentToTeacher(mockTeacherStudentDTO)).toBe(
        'Student registered to teacher',
      );
    });
  });
});

describe('RegisterStudentToTeacherHandler', () => {
  let handler: RegisterStudentToTeacherHandler;
  let teachersResourceMock: jest.Mocked<ITeachersResource>;
  let studentsResourceMock: jest.Mocked<IStudentsResource>;
  let teacherStudentsResourceMock: jest.Mocked<ITeacherStudentsResource>;

  beforeEach(() => {
    teachersResourceMock = {
      one: jest.fn(),
      addTeacher: jest.fn(),
      remove: jest.fn(),
    } as jest.Mocked<ITeachersResource>;

    studentsResourceMock = {
      one: jest.fn(),
      addStudent: jest.fn(),
      remove: jest.fn(),
    } as jest.Mocked<IStudentsResource>;

    teacherStudentsResourceMock = {
      one: jest.fn(),
      addStudent: jest.fn(),
      removeStudentFromTeacher: jest.fn(),
    } as jest.Mocked<ITeacherStudentsResource>;

    handler = new RegisterStudentToTeacherHandler(
      teachersResourceMock,
      studentsResourceMock,
      teacherStudentsResourceMock,
    );
  });

  it('should assign the students to the teacher', async () => {
    teachersResourceMock.one.mockResolvedValueOnce(mockTeacherDTO);
    studentsResourceMock.one.mockResolvedValueOnce(mockStudentDTO);
    teacherStudentsResourceMock.one.mockResolvedValueOnce(null);

    await handler.execute(
      new RegisterStudentsToTeacherCommand(mockTeacherStudentDTO),
    );

    expect(teacherStudentsResourceMock.one).toHaveBeenCalledWith(
      mockTeacherStudentDTO.teacher,
      mockStudentDTO.email,
    );
    expect(teacherStudentsResourceMock.addStudent).toHaveBeenCalledWith(
      mockTeacherDTO,
      mockStudentDTO,
    );
  });

  it('throws TeacherNotFoundException when the teacher is not found', async () => {
    teachersResourceMock.one.mockResolvedValueOnce(null);

    await expect(
      handler.execute(
        new RegisterStudentsToTeacherCommand(mockTeacherStudentDTO),
      ),
    ).rejects.toThrow(new TeacherNotFoundException(mockTeacherDTO.email));
  });

  it('throws TeacherNotFoundException when the teacher is not found', async () => {
    teachersResourceMock.one.mockResolvedValueOnce(mockTeacherDTO);
    studentsResourceMock.one.mockResolvedValueOnce(null);

    await expect(
      handler.execute(
        new RegisterStudentsToTeacherCommand(mockTeacherStudentDTO),
      ),
    ).rejects.toThrow(new StudentNotFoundException(mockStudentDTO.email));
  });

  it('throws TeacherNotFoundException when the teacher is not found', async () => {
    teachersResourceMock.one.mockResolvedValueOnce(mockTeacherDTO);
    studentsResourceMock.one.mockResolvedValueOnce(mockStudentDTO);
    teacherStudentsResourceMock.one.mockResolvedValueOnce({
      teacherName: 'Test',
      teacherEmail: 'test@example.com',
      studentName: 'stud',
      studentEmail: 'student1@example.com',
    });

    await expect(
      handler.execute(
        new RegisterStudentsToTeacherCommand(mockTeacherStudentDTO),
      ),
    ).rejects.toThrow(
      new StudentAlreadyAssignedException(
        mockStudentDTO.email,
        mockTeacherDTO.email,
      ),
    );
  });
});
