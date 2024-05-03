import { Module } from '@nestjs/common';
import {
  CreateStudentModule,
  GetStudentsWithTeachersModule,
} from '../features';

@Module({
  imports: [CreateStudentModule, GetStudentsWithTeachersModule],
})
export class StudentModule {}
