import { Global, Module } from '@nestjs/common';

import {
  IStudentsResource,
  ITeachersResource,
  ITeacherStudentsResource,
} from 'src/core';

import {
  StudentsResource,
  TeachersResource,
  TeacherStudentsResource,
} from '../resources';

@Global()
@Module({
  providers: [
    {
      provide: IStudentsResource,
      useClass: StudentsResource,
    },
    {
      provide: ITeachersResource,
      useClass: TeachersResource,
    },
    {
      provide: ITeacherStudentsResource,
      useClass: TeacherStudentsResource,
    },
  ],
  exports: [IStudentsResource, ITeachersResource, ITeacherStudentsResource],
})
export class DynamoModule {}
