import { IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class UpdateStudentDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class AssignToTeacherDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}
