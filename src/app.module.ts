import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonModule } from './core/person.module';
import { TeacherModule } from './core/modules/teacher.module';

@Module({
  imports: [PersonModule, TeacherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
