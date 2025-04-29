import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from '../folders/entities/folder.entity';
import { File } from './entities/file.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { HttpModule } from '@nestjs/axios';
import { Request } from 'express';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
  imports: [
    TypeOrmModule.forFeature([File, Folder]),
    MulterModule.register({
      fileFilter: (_, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'ascii').toString('utf8');
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req: Request, file, cb) => {
          //@ts-ignore
          const userId: string = `${req['user']?.sub}`;
          const uploadPath = path.join('../uploads', userId);
          // Проверяем и создаем директорию, если её нет
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          cb(null, `${path.parse(file.originalname).name}-${uniqueSuffix}${ext}`);
        }
      })
    }),
    HttpModule,
  ],

})
export class FilesModule {}
