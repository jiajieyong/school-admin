import { Module } from '@nestjs/common';
import { CreateStudentModule } from '../features/create-student';
import { GetStudentsWithTeachersModule } from '../features/get-all-students';

@Module({
  imports: [CreateStudentModule, GetStudentsWithTeachersModule],
})
export class StudentModule {}
