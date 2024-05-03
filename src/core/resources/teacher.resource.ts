import { Injectable } from '@nestjs/common';

import { CreateTeacherDto, Teacher, ITeachersResource } from 'src/core';

import { TEACHER_ID_PREFIX } from '../utils/constants';

import { ItemKey, Resource } from '../utils/resource';

@Injectable()
export class TeachersResource
  extends Resource<Teacher>
  implements ITeachersResource
{
  constructor() {
    super({ entityTemplate: Teacher, pkPrefix: TEACHER_ID_PREFIX });
  }

  addTeacher(dto: CreateTeacherDto): Promise<string | undefined> {
    return this.create({
      dto,
      decorator: decorateTeacher,
    });
  }
}

function decorateTeacher(
  teacher: CreateTeacherDto & ItemKey & { createdAt: Date },
) {
  return {
    ...teacher,
    createdAt: teacher.createdAt.toISOString(),
    /* for fetching all teachers */
    GSI1PK: 'TEACHER_INDEX',
    GSI1SK: teacher.SK,
  };
}
