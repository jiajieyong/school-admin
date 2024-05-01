import {
  Controller,
  Delete,
  Module,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { ITeachersResource } from 'src/core';

class DeleteTeacherCommand {
  constructor(public readonly teacherEmail: string) {}
}

@Controller()
class DeleteTeacherController {
  constructor(private readonly commandBus: CommandBus) {}
  @Delete('teachers/:id')
  deletePatient(@Param('id') teacherEmail: string) {
    return this.commandBus.execute(new DeleteTeacherCommand(teacherEmail));
  }
}

@CommandHandler(DeleteTeacherCommand)
class DeleteTeacherHandler implements ICommandHandler<DeleteTeacherCommand> {
  constructor(private readonly teachers: ITeachersResource) {}

  async execute({ teacherEmail }: DeleteTeacherCommand) {
    const teacher = await this.teachers.one(teacherEmail);
    if (!teacher) {
      throw new NotFoundException(`Teacher, Email ${teacherEmail}, not found`);
    }
    return this.teachers.remove(teacherEmail);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [DeleteTeacherController],
  // providers: [DeleteTeacherHandler],
})
export class DeleteTeacherModule {}
