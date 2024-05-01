import { Injectable } from '@nestjs/common';

import {
  AssignToTeacherDto,
  Teacher,
  TeacherStudent,
  ITeacherStudentsResource,
} from 'src/core';

import { TEACHER_ID_PREFIX, STUDENT_ID_PREFIX } from '../utils/constants';
import { ItemKey, Resource } from '../utils/resource';

Injectable();
export class TeacherStudentsResource
  extends Resource<TeacherStudent>
  implements ITeacherStudentsResource
{
  constructor() {
    super({
      entityTemplate: TeacherStudent,
      pkPrefix: TEACHER_ID_PREFIX,
      skPrefix: STUDENT_ID_PREFIX,
    });
  }

  addStudent(
    teacher: Teacher,
    addStudentDto: AssignToTeacherDto,
  ): Promise<string | undefined> {
    const decorator = generateDecorator(teacher);
    return this.create({
      dto: addStudentDto,
      parentId: teacher.email,
      decorator,
    });
  }
}

function generateDecorator(teacher: Teacher) {
  return function decorateDoctorPatient(
    addStudentDto: AssignToTeacherDto & ItemKey,
  ) {
    return {
      PK: addStudentDto.PK,
      SK: addStudentDto.SK,
      studentName: addStudentDto.name,
      studentEmail: addStudentDto.email,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      GSI1PK: addStudentDto.SK,
      GSI1SK: addStudentDto.PK,
    };
  };
}
