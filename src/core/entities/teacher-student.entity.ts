export class TeacherStudent {
  teacherEmail: string;
  teacherName: string;
  studentName: string;
  studentEmail: string;

  constructor(
    teacherEmail: string = '',
    teacherName: string = '',
    studentName: string = '',
    studentEmail: string = '',
  ) {
    this.teacherEmail = teacherEmail;
    this.teacherName = teacherName;
    this.studentEmail = studentEmail;
    this.studentName = studentName;
  }
}
