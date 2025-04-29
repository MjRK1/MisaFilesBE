import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { FilesService } from '../files/files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { File } from '../files/entities/file.entity';
import { FilesModule } from '../files/files.module';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService, FilesService],
  imports: [TypeOrmModule.forFeature([File, Folder]), FilesModule],
})
export class FoldersModule {}
