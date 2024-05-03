import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  DynamoModule,
  StudentModule,
  TeacherStudentModule,
  TeacherModule,
} from 'src/core';

@Module({
  imports: [DynamoModule, StudentModule, TeacherStudentModule, TeacherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
