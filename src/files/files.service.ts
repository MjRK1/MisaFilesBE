import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import * as path from 'node:path';
import { Folder } from '../folders/entities/folder.entity';
import sharp from 'sharp';
import { IResponseFile } from '../types/files/files';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,

    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  async getRootFiles(userId: string): Promise<IResponseFile[]> {
    const files = await this.fileRepository.find({
      where: {userId, folder: null}
    });
    return files.map(file => ({
      id: file.id,
      name: file.name,
      folder: null,
      size: file.size,
      createdAt: file.createdAt,
    }));
  }

  async uploadFile(userId: string, file: Express.Multer.File, folderId?: string | null) {
;
    const filePath = path.join('../uploads', userId, file?.filename);
    let folder: Folder | null = null;
    if (folderId && typeof folderId === 'string') {
      folder = await this.folderRepository.findOne({
          where: {
            id: folderId, userId: userId
          }
      });
    }
    let thumbnailPath: string | null = null;
    if (file.mimetype.startsWith('image/')) {
      const thumbName = `thumb-${file.filename}`;
      thumbnailPath = path.join(`../uploads/${userId}`, thumbName);

      await sharp(file.path)
        .resize(200, 200) // Размер миниатюры
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    }

    const newFile = this.fileRepository.create({
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      path: filePath,
      thumbnailPath: thumbnailPath ?? null,
      userId,
      folder: folder ?? null,
    });

    return this.fileRepository.save(newFile);
  }


  async getFileById(userId: string, fileId: string) {
    return await this.fileRepository.findOne({where: {userId, id: fileId}});
  }
}
