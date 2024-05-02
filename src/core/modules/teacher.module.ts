import { Module } from '@nestjs/common';
import { TeacherService } from '../services/teacher.service';
import { TeacherController } from '../controllers/teacher.controller';
import { RegisterStudentToTeacherModule } from '../features/register-student-to-teacher';
import { DeleteTeacherModule } from '../features/delete-teacher';
import { ListStudentsForTeachersModule } from '../features/list-students-for-teachers';

@Module({
  imports: [
    RegisterStudentToTeacherModule,
    ListStudentsForTeachersModule,
    DeleteTeacherModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
