import { Module } from '@nestjs/common';
import {
  CreateTeacherModule,
  GetTeachersWithStudentsModule,
  ListStudentsForTeachersModule,
} from '../features';

@Module({
  imports: [
    CreateTeacherModule,
    GetTeachersWithStudentsModule,
    ListStudentsForTeachersModule,
  ],
})
export class TeacherModule {}
