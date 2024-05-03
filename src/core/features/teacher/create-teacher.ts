import {
  Body,
  Controller,
  Module,
  Post,
  ConflictException,
} from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { CreateTeacherDto, ITeachersResource } from 'src/core';

export class CreateTeacherCommand {
  constructor(public readonly createTeacherDto: CreateTeacherDto) {}
}

@Controller()
export class CreateTeacherController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('teachers')
  createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    return this.commandBus.execute(new CreateTeacherCommand(createTeacherDto));
  }
}

@CommandHandler(CreateTeacherCommand)
export class CreateTeacherHandler
  implements ICommandHandler<CreateTeacherCommand>
{
  constructor(private readonly Teachers: ITeachersResource) {}

  async execute({ createTeacherDto }: CreateTeacherCommand) {
    const Teacher = await this.Teachers.one(createTeacherDto.email);
    if (Teacher) {
      throw new ConflictException(
        `Teacher, Email ${createTeacherDto.email}, already exists`,
      );
    }
    return this.Teachers.addTeacher(createTeacherDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateTeacherController],
  providers: [CreateTeacherHandler],
})
export class CreateTeacherModule {}
