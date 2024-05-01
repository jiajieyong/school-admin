import { CreateStudentDto } from '../dto/student.dto';
import { Student } from '../entities';

export abstract class IStudentsResource {
  abstract addStudent(
    createStudentDto: CreateStudentDto,
  ): Promise<string | undefined>;
  abstract one(studentEmail: string): Promise<Student | undefined>;
}
