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
    const teacherStudent = await this.teacherStudents.one(
      teacherEmail,
      studentEmail,
    );
    if (!teacherStudent) {
      throw new NotFoundException(
        `Student, Email ${studentEmail}, is not registered to Teacher, Email ${teacherEmail}`,
      );
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
