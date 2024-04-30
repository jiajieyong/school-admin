import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './core/modules/student.module';
import { TeacherModule } from './core/modules/teacher.module';

@Module({
  imports: [StudentModule, TeacherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
