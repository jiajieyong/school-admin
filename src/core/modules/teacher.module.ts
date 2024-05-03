import { Module } from '@nestjs/common';
import { RegisterStudentToTeacherModule } from '../features/register-student-to-teacher';
import { DeregisterStudentModule } from '../features/deregister-student-from-teacher';
import { ListStudentsForTeachersModule } from '../features/list-students-for-teachers';
import { CreateTeacherModule } from '../features/create-teacher';
import { GetTeachersWithStudentsModule } from '../features/get-all-teachers';

@Module({
  imports: [
    CreateTeacherModule,
    GetTeachersWithStudentsModule,
    RegisterStudentToTeacherModule,
    ListStudentsForTeachersModule,
    DeregisterStudentModule,
  ],
})
export class TeacherModule {}
