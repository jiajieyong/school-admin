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

import { CreateStudentDto, IStudentsResource } from 'src/core';

class CreateStudentCommand {
  constructor(public readonly createStudentDto: CreateStudentDto) {}
}

@Controller()
class CreateStudentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('Students')
  createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.commandBus.execute(new CreateStudentCommand(createStudentDto));
  }
}

@CommandHandler(CreateStudentCommand)
class CreateStudentHandler implements ICommandHandler<CreateStudentCommand> {
  constructor(private readonly Students: IStudentsResource) {}

  async execute({ createStudentDto }: CreateStudentCommand) {
    const Student = await this.Students.one(createStudentDto.email);
    if (Student) {
      throw new ConflictException(
        `Student, Email ${createStudentDto.email}, already exists`,
      );
    }
    return this.Students.addStudent(createStudentDto);
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [CreateStudentController],
  providers: [CreateStudentHandler],
})
export class CreateStudentModule {}
