import { Body, Controller, Module, Post } from '@nestjs/common';
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
  ITeacherStudentsResource,
} from 'src/core';
import {
  StudentAlreadyAssignedException,
  StudentNotFoundException,
  TeacherNotFoundException,
} from '../../utils/exceptions';

export class RegisterStudentsToTeacherCommand {
  constructor(
    public readonly registerStudentDto: RegisterStudentsToTeacherDto,
  ) {}
}

@Controller()
export class RegisterStudentToTeacherController {
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
export class RegisterStudentToTeacherHandler
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
      throw new TeacherNotFoundException(registerStudentDto.teacher);
    }

    for (const studentEmail of registerStudentDto.students) {
      const student = await this.students.one(studentEmail);
      if (!student) {
        throw new StudentNotFoundException(studentEmail);
      }

      const teacherStudent = await this.teacherStudents.one(
        registerStudentDto.teacher,
        studentEmail,
      );
      if (teacherStudent) {
        throw new StudentAlreadyAssignedException(studentEmail, teacher.email);
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
