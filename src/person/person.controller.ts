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
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Controller('api')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post('/teachers')
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto, 'TEACHER');
  }

  @Post('/students')
  addStudent(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto, 'STUDENT');
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
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    return this.personService.update(personId, updatePersonDto);
  }

  @Delete(':personId')
  remove(@Param('personId') personId: string) {
    return this.personService.remove(personId);
  }
}
