import { Body, Controller, Module, Post } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  ICommandHandler,
} from '@nestjs/cqrs';

import { CreateStudentDto, IStudentsResource } from 'src/core';
import { StudentAlreadyExistsException } from '../../utils/exceptions';

export class CreateStudentCommand {
  constructor(public readonly createStudentDto: CreateStudentDto) {}
}

@Controller()
export class CreateStudentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('Students')
  createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.commandBus.execute(new CreateStudentCommand(createStudentDto));
  }
}

@CommandHandler(CreateStudentCommand)
export class CreateStudentHandler
  implements ICommandHandler<CreateStudentCommand>
{
  constructor(private readonly Students: IStudentsResource) {}

  async execute({ createStudentDto }: CreateStudentCommand) {
    const Student = await this.Students.one(createStudentDto.email);
    if (Student) {
      throw new StudentAlreadyExistsException(createStudentDto.email);
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
