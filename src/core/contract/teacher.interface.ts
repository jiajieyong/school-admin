import { CreateTeacherDto } from '../dto/teacher.dto';

import { Teacher } from '../entities/teacher.entity';

export abstract class ITeachersResource {
  abstract addTeacher(
    createTeacherDto: CreateTeacherDto,
  ): Promise<string | undefined>;
  abstract one(teacherId: string): Promise<Teacher | undefined>;
  abstract update(
    teacherId: string,
    updateTeacherDto: Partial<Teacher>,
  ): Promise<Teacher>;
  abstract remove(teacherId: string): Promise<string>;
}
