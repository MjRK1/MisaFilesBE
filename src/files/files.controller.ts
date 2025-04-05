import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Get,
  NotFoundException,
  Res, UseGuards, Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { IResponseFile } from '../types/files/files';
import { AuthGuard } from '../auth/auth.guard';

// @UseGuards(AuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}


  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFiles(
    @Body() body: { folderId: string | null },
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.filesService.uploadFile(req['user'].sub, file, body?.folderId ?? null);
  }

  @Get()
  async getRootFiles(
    @Req() req: Request,
  ): Promise<IResponseFile[]> {
    return this.filesService.getRootFiles(req['user'].sub);
  }

  @Get(':fileId')
  async getFileImage(
    @Req() req: Request,
    @Param('fileId') fileId: string,
    @Res() res: Response
  ) {
    const file = await this.filesService.getFileById(req['user'].sub, fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    res.set({
      'Content-Type': `image/${file.name}`,
      'Content-Disposition': `attachment; filename="${file.name}"`,
    });
    return res.sendFile(path.resolve(file.path));
  }

  @Get(':fileId/thumb')
  async getThumbnail(
    @Req() req: Request,
    @Param('fileId') fileId: string,
    @Res() res: Response
  ) {
    const file = await this.filesService.getFileById(req['user'].sub, fileId);
    if (!file) {
      throw new NotFoundException('Thumb not found.');
    }
    const thumbnailName = file.thumbnailPath.split('/')[file.thumbnailPath.split('.').length - 1];
    res.set({
        'Content-Type': `image/${thumbnailName.split('.')[1]}`,
        'Content-Disposition': `attachment; filename="${thumbnailName}"`,
    });
    return res.sendFile(path.resolve(file.thumbnailPath));
  }
}
