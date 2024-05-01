import { IsString, IsArray } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class UpdateTeacherDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class RegisterStudentsToTeacherDto {
  @IsString()
  teacher: string;

  @IsArray()
  students: string[];
}
