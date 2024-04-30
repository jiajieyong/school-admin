import { Module } from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { StudentController } from '../controllers/student.controller';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
