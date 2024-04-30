import { IsString } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class CreateStudentDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['id'] as const),
) {}
