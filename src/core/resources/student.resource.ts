import { Injectable } from '@nestjs/common';
import { CreateStudentDto, IStudentsResource, Student } from 'src/core';
import { STUDENT_ID_PREFIX } from '../utils/constants';
import { ItemKey, Resource } from '../utils/resource';

@Injectable()
export class StudentsResource
  extends Resource<Student>
  implements IStudentsResource
{
  constructor() {
    super({ entityTemplate: Student, pkPrefix: STUDENT_ID_PREFIX });
  }

  addStudent(dto: CreateStudentDto): Promise<string | undefined> {
    return this.create({
      dto,
      decorator: decorateStudent,
    });
  }
}

function decorateStudent(
  student: CreateStudentDto & ItemKey & { createdAt: Date },
) {
  return {
    ...student,
    createdAt: student.createdAt.toISOString(),
    /* for fetching all students */
    GSI1PK: 'STUDENT_INDEX',
    GSI1SK: student.SK,
  };
}
