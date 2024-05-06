# School Admininstrative System API made with NestJS and DynamoDB

## Installation
> **Prerequisites**: requires node and docker installed

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Test

```bash
# unit tests
$ npm run test

# watch mode
$ npm run test:watch

# test coverage
$ npm run test:cov
```

## Entities

- Teacher
- Student
- TeacherStudent - to address many-to-many relationship between Teachers and Students

## Entity chart

<table>
  <thead>
    <tr>
      <th>ENTITY</th>
      <th>PK</th>
      <th>SK</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Student</td>
      <td>STUDENT#&lt;StudentEmail&gt;</td>
      <td>STUDENT#&lt;StudentEmail&gt;</td>
    </tr>
    <tr>
      <td>Teacher</td>
      <td>TEACHER#&lt;TeacherEmail&gt;</td>
      <td>TEACHER#&lt;TeacherEmail&gt;</td>
    </tr>
    <tr>
      <td>TeacherStudent</td>
      <td>TEACHER#&lt;TeacherEmail&gt;</td>
      <td>STUDENT#&lt;StudentEmail&gt;</td>
    </tr>
  </tbody>
</table>

## GSI1 TABLE

<table>
  <thead>
    <tr>
      <th>ENTITY</th>
      <th>GSI1PK</th>
      <th>GSI1SK</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Student</td>
      <td>STUDENT#INDEX</td>
      <td>STUDENT#&lt;StudentEmail&gt;</td>
    </tr>
    <tr>
      <td>Teacher</td>
      <td>TEACHER#INDEX</td>
      <td>TEACHER#&lt;TeacherEmail&gt;</td>
    </tr>
    <tr>
      <td>TeacherStudent</td>
      <td>STUDENT#&lt;StudentEmail&gt;</td>
      <td>TEACHER#&lt;TeacherEmail&gt;</td>
    </tr>
  </tbody>
</table>

## Access patterns

<table border="1">
  <thead>
    <tr>
      <th>ENTITY</th>
      <th>ACCESS PATTERN</th>
      <th>INDEX</th>
      <th>PARAMS</th>
      <th>NOTES</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">Student</td>
      <td>Create</td>
      <td>/</td>
      <td>pk: STUDENT#&lt;StudentEmail&gt; sk: STUDENT#&lt;StudentEmail&gt;</td>
      <td>/</td>
    </tr>
    <tr>
      <td>Get</td>
      <td>GSI1</td>
      <td>pk: STUDENT#INDEX</td>
      <td>Projection Expression: email</td>
    </tr>
    <tr>
      <td rowspan="2">Teacher</td>
      <td>Create</td>
      <td>/</td>
      <td>pk: TEACHER#&lt;TeacherEmail&gt; sk: TEACHER#&lt;TeacherEmail&gt;</td>
      <td>/</td>
    </tr>
    <tr>
      <td>Get</td>
      <td>GSI1</td>
      <td>pk: TEACHER#INDEX</td>
      <td>Projection Expression: email</td>
    </tr>
    <tr>
      <td rowspan="4">TeacherStudent</td>
      <td>Register student to teacher</td>
      <td>/</td>
      <td>pk: TEACHER#&lt;TeacherEmail&gt; sk: STUDENT#&lt;StudentEmail&gt;</td>
      <td>Many-to-many rel for teachers and students, uses GSI1</td>
    </tr>
    <tr>
      <td>Deregister student from teacher</td>
      <td>/</td>
      <td>pk: DOCTOR#&lt;DoctorId&gt; sk: PATIENT#&lt;PatientId&gt;</td>
      <td>/</td>
    </tr>
    <tr>
      <td>List of students with teachers that they are assigned to</td>
      <td>GSI1</td>
      <td>pk: STUDENT#&lt;StudentEmail&gt; sk: begins_with(TEACHER#)</td>
      <td>Using the list of student emails from the student GET request</td>
    </tr>
    <tr>
      <td>List of teachers with students assigned under them</td>
      <td>/</td>
      <td>pk: TEACHER#&lt;TeacherEmail&gt; sk: begins_with(STUDENT#)</td>
      <td>Using the list of teacher emails from the teacher GET request</td>
    </tr>
  </tbody>
</table>
