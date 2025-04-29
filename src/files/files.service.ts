import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { File } from './entities/file.entity';
import * as path from 'node:path';
import { Folder } from '../folders/entities/folder.entity';
import sharp from 'sharp';
import { IResponseFile } from '../types/files/files';
import * as fs from 'fs/promises';

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
      where: { userId, folder: null },
    });
    return files.map(file => ({
      id: file.id,
      name: file.name,
      folder: null,
      size: file.size,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    }));
  }

  async uploadFile(userId: string, files: Express.Multer.File[], folderId?: string | null) {
    const savedFiles = [];
    let folder: Folder | null = null;
    if (folderId && typeof folderId === 'string') {
      folder = await this.folderRepository.findOne({
        where: {
          id: folderId ?? IsNull(),
          userId: userId,
        },
      });
    }
    for (const file of files) {
      const filePath = path.join('../uploads', userId, file?.filename);
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
      await this.fileRepository.save(newFile);

      savedFiles.push({
        id: newFile.id,
        name: newFile.name,
        folder: folderId ? folderId : null,
        size: newFile.size,
        mimeType: newFile.mimeType,
        createdAt: newFile.createdAt,
      });
    }

    return savedFiles;
  }

  async getFileById(userId: string, fileId: string) {
    return await this.fileRepository.findOne({ where: { userId, id: fileId } });
  }

  async deleteFile(userId: string, fileId: string) {
    const file = await this.fileRepository.findOne({
      where: {
        userId,
        id: fileId,
      }
    });
    if (!file) {
      throw new NotFoundException(`Файл ${fileId} не найден`);
    }

    if (file.path) {
      const absoluteFilePath = path.resolve(file.path);
      try {
        await fs.unlink(absoluteFilePath);
      } catch (err) {
        throw new BadRequestException(`Не удалось удалить файл: ${absoluteFilePath}`, err);
      }
    }

    await this.fileRepository.remove(file);
    return {message: `Файл успешно удален`};
  }

  async getFileForDownload(userId: string, fileId: string) {
    const file = await this.fileRepository.findOne({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!file) {
      throw new NotFoundException('Файл не найден');
    }

    return file;
  }

  async moveFile(userId: string, fileId: string, folderId?: string | null) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, userId },
      relations: ['folder'], // важно на случай, если понадобятся данные о папке
    });

    if (!file) {
      throw new BadRequestException(`Ошибка перемещения файла`);
    }

    if (folderId) {
      const targetFolder = await this.folderRepository.findOne({
        where: { id: folderId, userId }
      });

      if (!targetFolder) {
        throw new BadRequestException(`Папка не найдена`);
      }

      file.folder = targetFolder;
    } else {
      file.folder = null;
    }

    await this.fileRepository.save(file);
    return { message: 'success', result: true };
  }
}
