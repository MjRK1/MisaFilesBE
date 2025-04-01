import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { FilesService } from '../files/files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService, FilesService],
  imports: [TypeOrmModule.forFeature([File, Folder])],
})
export class FoldersModule {}
