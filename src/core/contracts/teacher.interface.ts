import { CreateTeacherDto } from '../dto/teacher.dto';

import { Teacher } from '../entities';
export abstract class ITeachersResource {
  abstract addTeacher(
    createTeacherDto: CreateTeacherDto,
  ): Promise<string | undefined>;
  abstract one(teacherEmail: string): Promise<Teacher | undefined>;
  abstract remove(teacherEmail: string): Promise<string>;
}
