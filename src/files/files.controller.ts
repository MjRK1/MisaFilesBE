import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  Get,
  NotFoundException,
  Res, Req, Delete,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'node:path';
import { IResponseFile } from '../types/files/files';

// @UseGuards(AuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}


  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @Body() body: { folderId: string | null },
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.filesService.uploadFile(String(req['user'].sub), files, JSON.parse(body.folderId ?? null));
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
        'Content-Type': `image/${thumbnailName.split('.')[thumbnailName.split('.')?.length - 1]}`,
        'Content-Disposition': `attachment; filename="thumb"`,
    });
    return res.sendFile(path.resolve(file.thumbnailPath));
  }

  @Delete(':fileId')
  async deleteFile(
    @Req() req: Request,
    @Param('fileId') fileId: string
  ) {
    return this.filesService.deleteFile(req['user'].sub, fileId);
  }

  @Get('download/:fileId')
  async downloadFile(
    @Req() req: Request,
    @Param('fileId') fileId: string,
    @Res() res: Response
  ) {
    const userId = String(req['user'].sub);

    const file = await this.filesService.getFileForDownload(userId, fileId);
    res.set({
      'Content-Type': file.mimeType,
    });
    const absolutePath = path.resolve(file.path);
    res.download(absolutePath, file.name, (err) => {
      if (err) {
        res.status(500).send('Не удалось скачать файл');
      }
    });
  }

  @Post('move')
  async moveFile(
    @Req() req: Request,
    @Body() body: { fileId: string, folderId?: string | null}) {
    return await this.filesService.moveFile(req['user'].sub, body.fileId, body?.folderId)
  }
}
