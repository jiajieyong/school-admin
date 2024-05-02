import { Module } from '@nestjs/common';
import { TeacherService } from '../services/teacher.service';
import { TeacherController } from '../controllers/teacher.controller';
import { RegisterStudentToTeacherModule } from '../features/register-student-to-teacher';
import { DeregisterStudentModule } from '../features/deregister-student-from-teacher';
import { ListStudentsForTeachersModule } from '../features/list-students-for-teachers';

@Module({
  imports: [
    RegisterStudentToTeacherModule,
    ListStudentsForTeachersModule,
    DeregisterStudentModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
