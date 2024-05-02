import {
  Body,
  ConflictException,
  Controller,
  Module,
  NotFoundException,
  Post,
} from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';
import {
  RegisterStudentsToTeacherDto,
  ITeachersResource,
  IStudentsResource,
} from 'src/core';
import { ITeacherStudentsResource } from '../contracts/teacher-students.interface';

class RegisterStudentsToTeacherCommand {
  constructor(
    public readonly registerStudentDto: RegisterStudentsToTeacherDto,
  ) {}
}

@Controller()
class RegisterStudentToTeacherController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  addStudentToTeacher(
    @Body() registerStudentDto: RegisterStudentsToTeacherDto,
  ) {
    return this.commandBus.execute(
      new RegisterStudentsToTeacherCommand(registerStudentDto),
    );
  }
}

@CommandHandler(RegisterStudentsToTeacherCommand)
class RegisterStudentToTeacherHandler
  implements ICommandHandler<RegisterStudentsToTeacherCommand>
{
  constructor(
    private readonly teachers: ITeachersResource,
    private readonly students: IStudentsResource,
    private readonly teacherStudents: ITeacherStudentsResource,
  ) {}

  async execute({ registerStudentDto }: RegisterStudentsToTeacherCommand) {
    const teacher = await this.teachers.one(registerStudentDto.teacher);
    if (!teacher) {
      throw new NotFoundException(
        `Teacher, Email ${registerStudentDto.teacher}, not found`,
      );
    }

    for (const studentEmail of registerStudentDto.students) {
      const student = await this.students.one(studentEmail);
      if (!student) {
        throw new NotFoundException(
          `Student, Email ${studentEmail}, not found`,
        );
      }

      const teacherStudent = await this.teacherStudents.one(
        registerStudentDto.teacher,
        studentEmail,
      );
      if (teacherStudent) {
        throw new ConflictException(
          `Student, email ${studentEmail}, already assigned to Teacher, email ${teacher.email}`,
        );
      }

      this.teacherStudents.addStudent(teacher, student);
    }
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [RegisterStudentToTeacherController],
  providers: [RegisterStudentToTeacherHandler],
})
export class RegisterStudentToTeacherModule {}
