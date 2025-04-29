import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { IsNull, Repository } from 'typeorm';
import { File } from '../files/entities/file.entity';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,

    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  async createFolder(createFolderDto: CreateFolderDto, userId: string) {
    if (
      createFolderDto.name === "null" ||
      !createFolderDto?.name?.length
    ) {
      throw new BadRequestException(`Введите название!`)
    }
    const folderWithName = await this.folderRepository.find({
      where: {
        name: createFolderDto.name ?? IsNull(),
        parentFolderId: createFolderDto?.parentFolderId ?? IsNull(),
        userId
      }
    });
    if (folderWithName?.length) {
      throw new BadRequestException(`Папка с именем "${createFolderDto.name}" уже существует!`);
    }
    const newFolder = this.folderRepository.create({
      name: createFolderDto.name,
      parentFolderId: createFolderDto.parentFolderId ?? null,
      userId
    });
    const folder = await this.folderRepository.save(newFolder);
    return {
      name: folder.name,
      parentFolderId: folder.parentFolderId,
      id: folder.id
    };
  }

  async getFolderContents(userId: string, folderId?: string) {
    if (folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: folderId, userId },
        relations: ['files', 'subfolders'],
      });
      if (!folder) {
        throw new NotFoundException(`Папка ${folderId} не найдена`);
      }

      return {
        id: folder.id,
        name: folder.name,
        parentFolderId: folder.parentFolderId ?? null,
        folders: folder.subfolders.map(subfolder => ({
          id: subfolder.id,
          name: subfolder.name,
          parentFolderId: subfolder.parentFolderId ?? null,
        })),
        files: folder.files.map(file => ({
          id: file.id,
          name: file.name,
          folder: file.folder ? file.folder.id : null,
          size: file.size,
          mimeType: file.mimeType,
          createdAt: file.createdAt,
        })),
      };
    }
    const [rootFolders, rootFiles] = await Promise.all([
      this.folderRepository.find({
        where: { userId, parentFolderId: IsNull() }
      }),
      this.fileRepository.find({
        where: {
          userId, folder: IsNull()
        }
      })
    ]);
    return {
      id: null,
      name: null,
      parentFolderId: null,
      folders: rootFolders.map(folder => ({
        id: folder.id,
        name: folder.name,
        parentFolderId: folder.parentFolderId ?? null,
      })),
      files: rootFiles.map(file => ({
        id: file.id,
        name: file.name,
        folder: null,
        size: file.size,
        mimeType: file.mimeType,
        createdAt: file.createdAt,
      })),
    };
  }

  async deleteFolder(userId: string, folderId: string) {
    const folder = await this.folderRepository.findOne({
      where: {
        userId,
        id: folderId,
      }
    });
    if (!folder) {
      throw new BadRequestException(`Папка ${folderId} не найдена`);
    }

    await this.folderRepository.remove(folder);
    return {message: `Папка успешно удалена`};
  }

  async renameFolder(userId: string, folderId: string, newName: string) {
    const folder = await this.folderRepository.findOne({
      where: {
        userId,
        id: folderId
      }
    });
    const folderWithName = await this.folderRepository.find({
      where: {
        name: newName,
        parentFolderId: folder?.parentFolderId ?? IsNull(),
        userId
      }
    });
    if (folderWithName?.length) {
      throw new BadRequestException(`Папка с именем "${newName}" уже существует!`);
    }

    if (!folder) {
      throw new BadRequestException(`Folder ${folderId} not found`);
    }
    if (folder.name === newName) {
      throw new BadRequestException(`Folder with name "${newName}" already exist!`);
    }

    folder.name = newName;
    await this.folderRepository.save(folder);
    return folder;
  }

  async moveFolder(userId: string, folderId: string, newParentFolderId: string) {
    const folder = await this.folderRepository.findOne({
      where: {
        userId,
        id: folderId
      }
    });
    if (!folder) {
      throw new BadRequestException(`Folder ${folderId} not found`);
    }

    folder.parentFolderId = newParentFolderId;
    await this.folderRepository.save(folder);
    return { message: 'success', result: true };
  }

  async resolvePath(userId: string, path: string) {
    const parts = path.split('/').filter(Boolean);
    let currentParent: string | null = null;
    let currentFolder: Folder | null = null;
    for (const part of parts) {
      currentFolder = await this.folderRepository.findOne({
        where: {
          userId,
          name: part,
          parentFolderId: currentParent ?? IsNull(),
        },
      });
      if (!currentFolder) {
        throw new NotFoundException(`Папка "${part}" не найдена`);
      }
      currentParent = currentFolder.id;
    }

    return {
      id: currentFolder?.id ?? null,
      name: currentFolder?.name ?? null,
      parentFolderId: currentFolder?.parentFolderId ?? null,
    };
  }
}
