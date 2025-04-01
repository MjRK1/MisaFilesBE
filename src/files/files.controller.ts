import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Get,
  NotFoundException,
  Res
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { IResponseFile } from '../types/files/files';

@Controller(':userId/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}


  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFiles(
    @Body() body: { folderId: string | null },
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.filesService.uploadFile(userId, file, body?.folderId ?? null);
  }

  @Get()
  async getRootFiles(
    @Param('userId') userId: string
  ): Promise<IResponseFile[]> {
    return this.filesService.getRootFiles(userId);
  }

  @Get(':fileId')
  async getFileImage(
    @Param('userId') userId: string,
    @Param('fileId') fileId: string,
    @Res() res: Response
  ) {
    const file = await this.filesService.getFileById(userId, fileId);
    if (!file) {
      return new NotFoundException('File not found');
    }
    res.set({
      'Content-Type': `image/${file.name}`,
      'Content-Disposition': `attachment; filename="${file.name}"`,
    });
    return res.sendFile(path.resolve(file.path))
  }

  @Get(':fileId/thumb')
  async getThumbnail(
    @Param('userId') userId: string,
    @Param('fileId') fileId: string,
    @Res() res: Response
  ) {
    const file = await this.filesService.getFileById(userId, fileId);
    if (!file) {
      throw new NotFoundException('File not found.');
    }
    const thumbnailName = file.thumbnailPath.split('/')[file.thumbnailPath.split('.').length - 1];
    res.set({
        'Content-Type': `image/${thumbnailName.split('.')[1]}`,
        'Content-Disposition': `attachment; filename="${thumbnailName}"`,
    });
    return res.sendFile(path.resolve(file.thumbnailPath))
  }

}
