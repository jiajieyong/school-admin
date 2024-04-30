import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { CreateTeacherDto } from './dto/teacher.dto';
import { CreateStudentDto } from './dto/student.dto';

@Controller('api')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post('/students')
  addStudent(@Body() createPersonDto: CreateStudentDto) {
    return this.personService.create(createPersonDto);
  }

  @Get()
  findAll() {
    return this.personService.findAll();
  }

  @Get(':personId')
  findOne(@Param('personId') personId: string) {
    return this.personService.findOne(personId);
  }

  @Put(':personId')
  update(
    @Param('personId') personId: string,
    @Body() updateTeacherDto: CreateTeacherDto,
  ) {
    return this.personService.update(personId, updateTeacherDto);
  }

  @Delete(':personId')
  remove(@Param('personId') personId: string) {
    return this.personService.remove(personId);
  }
}
