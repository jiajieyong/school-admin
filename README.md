# School Admininstrative System API made with NestJS and DynamoDB

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

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
