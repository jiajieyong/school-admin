import { ConflictException, NotFoundException } from '@nestjs/common';

export class StudentAlreadyExistsException extends ConflictException {
  constructor(studentEmail: string) {
    super(`Student, Email ${studentEmail}, already exists`);
  }
}

export class StudentNotFoundException extends NotFoundException {
  constructor(studentEmail: string) {
    super(`Student, Email ${studentEmail}, not found`);
  }
}

export class TeacherAlreadyExistsException extends ConflictException {
  constructor(teacherEmail: string) {
    super(`Teacher, Email ${teacherEmail}, already exists`);
  }
}

export class TeacherNotFoundException extends NotFoundException {
  constructor(teacherEmail: string) {
    super(`Teacher, Email ${teacherEmail}, not found`);
  }
}

export class NoCommonStudentsFoundException extends NotFoundException {
  constructor() {
    super(`There are no common students among the list of teachers`);
  }
}
export class NoStudentRegisteredException extends NotFoundException {
  constructor(teacherEmail: string) {
    super(`There are no students registered to teacher, Email ${teacherEmail}`);
  }
}

export class StudentAlreadyAssignedException extends ConflictException {
  constructor(studentEmail: string, teacherEmail: string) {
    super(
      `Student, email ${studentEmail}, already assigned to Teacher, email ${teacherEmail}`,
    );
  }
}

export class StudentNotAssignedException extends NotFoundException {
  constructor(studentEmail: string, teacherEmail: string) {
    super(
      `Student, Email ${studentEmail}, is not registered to Teacher, Email ${teacherEmail}`,
    );
  }
}
