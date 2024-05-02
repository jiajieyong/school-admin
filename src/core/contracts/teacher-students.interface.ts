import { AssignToTeacherDto } from '../dto';

import { Teacher, TeacherStudent } from '../entities';

export abstract class ITeacherStudentsResource {
  abstract one(
    teacherEmail: string,
    studentEmail: string,
  ): Promise<TeacherStudent | undefined>;
  abstract addStudent(
    teacher: Teacher,
    addStudentDto: AssignToTeacherDto,
  ): Promise<string | undefined>;
  abstract removeStudentFromTeacher(
    teacherEmail: string,
    studentEmail: string,
  ): Promise<string | undefined>;
}
