import { CreateTeacherCommand } from './create-teacher';

describe('CreateTeacherCommand', () => {
  it('should create a CreateTeacherCommand instance', () => {
    const command = new CreateTeacherCommand({
      name: 'Test',
      email: 'test@test.com',
    });
    expect(command.createTeacherDto.name).toBe('Test');
    expect(command.createTeacherDto.email).toBe('test@test.com');
    expect(command instanceof CreateTeacherCommand).toBe(true);
  });
});
