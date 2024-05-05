import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  IStudentsResource,
  ITeachersResource,
  ITeacherStudentsResource,
} from 'src/core';

import {
  DeregisterStudentCommand,
  DeregisterStudentFromTeacherController,
  DeregisterStudentFromTeacherHandler,
} from './deregister-student-from-teacher';
import { StudentNotAssignedException } from '../../utils/exceptions';

const mockDeleteFromTeacherDTO = {
  teacher: 'test@example.com',
  student: 'student1@example.com',
  reason: 'mock reason',
};

const mockTeacherDTO = {
  name: 'Test',
  email: 'test@example.com',
};

const mockStudentDTO = {
  name: 'stud',
  email: 'student1@example.com',
};

describe('DeregisterStudentCommand', () => {
  it('should create a DeregisterStudentCommand instance', () => {
    const command = new DeregisterStudentCommand(mockDeleteFromTeacherDTO);
    expect(command.deleteFromTeacherDto.teacher).toBe('test@example.com');
    expect(command.deleteFromTeacherDto.student).toEqual(
      'student1@example.com',
    );
    expect(command.deleteFromTeacherDto.reason).toEqual('mock reason');
    expect(command instanceof DeregisterStudentCommand).toBe(true);
  });
});

describe('DeregisterStudentFromTeacherController', () => {
  let controller: DeregisterStudentFromTeacherController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DeregisterStudentFromTeacherController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: async () => 'Student de-registered from teacher',
          },
        },
      ],
    }).compile();
    controller = app.get<DeregisterStudentFromTeacherController>(
      DeregisterStudentFromTeacherController,
    );
  });

  describe('deleteFromTeacher', () => {
    it('should return "Student de-registered from teacher"', async () => {
      expect(await controller.deleteFromTeacher(mockDeleteFromTeacherDTO)).toBe(
        'Student de-registered from teacher',
      );
    });
  });

  describe('DeregisterStudentFromTeacherHandler', () => {
    let handler: DeregisterStudentFromTeacherHandler;
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

      handler = new DeregisterStudentFromTeacherHandler(
        teachersResourceMock,
        studentsResourceMock,
        teacherStudentsResourceMock,
      );
      teachersResourceMock.one.mockResolvedValueOnce(mockTeacherDTO);
      studentsResourceMock.one.mockResolvedValueOnce(mockStudentDTO);
    });

    it('should remove TeacherStudent entity', async () => {
      teacherStudentsResourceMock.one.mockResolvedValueOnce({
        teacherName: 'Test',
        teacherEmail: 'test@example.com',
        studentName: 'stud',
        studentEmail: 'student1@example.com',
      });

      await handler.execute(
        new DeregisterStudentCommand(mockDeleteFromTeacherDTO),
      );

      expect(teacherStudentsResourceMock.one).toHaveBeenCalledWith(
        mockDeleteFromTeacherDTO.teacher,
        mockDeleteFromTeacherDTO.student,
      );
      expect(
        teacherStudentsResourceMock.removeStudentFromTeacher,
      ).toHaveBeenCalledWith(
        mockDeleteFromTeacherDTO.teacher,
        mockDeleteFromTeacherDTO.student,
      );
    });

    it('throws StudentNotAssignedException when the teacher-student entity is not found', async () => {
      teacherStudentsResourceMock.one.mockResolvedValueOnce(null);

      await expect(
        handler.execute(new DeregisterStudentCommand(mockDeleteFromTeacherDTO)),
      ).rejects.toThrow(
        new StudentNotAssignedException(
          mockStudentDTO.email,
          mockTeacherDTO.email,
        ),
      );
    });
  });
});
