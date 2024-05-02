import {
  Controller,
  Delete,
  Module,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';
import {
  DeleteFromTeacherDto,
  IStudentsResource,
  ITeachersResource,
  ITeacherStudentsResource,
} from 'src/core';

class DeregisterStudentCommand {
  constructor(public readonly deleteFromTeacherDto: DeleteFromTeacherDto) {}
}

@Controller()
class DeregisterStudentFromTeacherController {
  constructor(private readonly commandBus: CommandBus) {}
  @Delete('deregister')
  deleteFromTeacher(@Body() deleteFromTeacherDto: DeleteFromTeacherDto) {
    return this.commandBus.execute(
      new DeregisterStudentCommand(deleteFromTeacherDto),
    );
  }
}

@CommandHandler(DeregisterStudentCommand)
class DeregisterStudentFromTeacherHandler
  implements ICommandHandler<DeregisterStudentCommand>
{
  constructor(
    private readonly teachers: ITeachersResource,
    private readonly students: IStudentsResource,
    private readonly teacherStudents: ITeacherStudentsResource,
  ) {}

  async execute({ deleteFromTeacherDto }: DeregisterStudentCommand) {
    const teacherEmail = deleteFromTeacherDto.teacher;
    const studentEmail = deleteFromTeacherDto.student;
    const teacher = await this.teachers.one(teacherEmail);
    if (!teacher) {
      throw new NotFoundException(`Teacher, Email ${teacherEmail}, not found`);
    }

    const student = await this.students.one(studentEmail);
    if (!student) {
      throw new NotFoundException(`Student, Email ${studentEmail}, not found`);
    }

    return this.teacherStudents.removeStudentFromTeacher(
      teacherEmail,
      studentEmail,
    );
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [DeregisterStudentFromTeacherController],
  providers: [DeregisterStudentFromTeacherHandler],
})
export class DeregisterStudentModule {}
