import { Module } from '@nestjs/common';
import { TeacherService } from '../services/teacher.service';
import { TeacherController } from '../controllers/teacher.controller';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
