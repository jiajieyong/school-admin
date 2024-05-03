import { Module } from '@nestjs/common';
import {
  DynamoModule,
  StudentModule,
  TeacherStudentModule,
  TeacherModule,
} from 'src/core';

@Module({
  imports: [DynamoModule, StudentModule, TeacherStudentModule, TeacherModule],
})
export class AppModule {}
