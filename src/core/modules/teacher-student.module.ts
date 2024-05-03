import { Module } from '@nestjs/common';
import {
  DeregisterStudentModule,
  RegisterStudentToTeacherModule,
} from '../features';

@Module({
  imports: [RegisterStudentToTeacherModule, DeregisterStudentModule],
})
export class TeacherStudentModule {}
