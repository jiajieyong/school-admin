import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { CreateStudentDto } from '../dto/student.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  addStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.studentService.findOne(email);
  }

  @Put(':personId')
  update(
    @Param('personId') personId: string,
    @Body() createStudentDto: CreateStudentDto,
  ) {
    return this.studentService.update(personId, createStudentDto);
  }

  @Delete(':personId')
  remove(@Param('personId') personId: string) {
    return this.studentService.remove(personId);
  }
}
