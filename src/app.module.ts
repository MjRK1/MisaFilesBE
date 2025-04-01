import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule } from './kafka/kafka.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from './files/files.module';
import { File } from './files/entities/file.entity';
import { FoldersModule } from './folders/folders.module';
import { Folder } from './folders/entities/folder.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') as string, 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [File, Folder], // Указываем сущности
        schema: configService.get('DB_SCHEMA'),
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'), // Для разработки можно оставить true
        autoLoadEntities: true,
        migrations: ["dist/db/migrations/*.js"],
      }),
      inject: [ConfigService],
    } as any),
    KafkaModule,
    FilesModule,
    FoldersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
