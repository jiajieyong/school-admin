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

  @Post('/teachers')
  create(@Body() createPersonDto: CreateTeacherDto) {
    return this.personService.create(createPersonDto);
  }

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
    @Body() updatePersonDto: CreateTeacherDto,
  ) {
    return this.personService.update(personId, updatePersonDto);
  }

  @Delete(':personId')
  remove(@Param('personId') personId: string) {
    return this.personService.remove(personId);
  }
}