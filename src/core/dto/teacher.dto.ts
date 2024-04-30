import { IsString } from 'class-validator';

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

export class AssignStudentToTeacherDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}
