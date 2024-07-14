import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { TeacherModule } from './teacher/teacher.module';
import { StudentModule } from './student/student.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectModule } from './subject/subject.module';
import { CenterModule } from './center/center.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Load environment-specific file
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // migrations: [__dirname + '/migration/**/*{.ts,.js}'],
        // migrations: false,
        // cli: {
        //   migrationsDir: 'src/migration',
        // },
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    SessionModule,
    TeacherModule,
    StudentModule,
    SubjectModule,
    CenterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
