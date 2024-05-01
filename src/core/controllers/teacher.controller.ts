import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateTeacherDto, TeacherService } from 'src/core';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.teacherService.findOne(email);
  }

  @Put(':personId')
  update(
    @Param('personId') personId: string,
    @Body() updateTeacherDto: CreateTeacherDto,
  ) {
    return this.teacherService.update(personId, updateTeacherDto);
  }

  @Delete(':personId')
  remove(@Param('personId') personId: string) {
    return this.teacherService.remove(personId);
  }
}
