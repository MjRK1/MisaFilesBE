import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { IsNull, Repository } from 'typeorm';
import { IResponseFolder } from '../types/folders/folders';

@Injectable()
export class FoldersService {
  constructor(
    private filesService: FilesService,

    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  async createFolder(createFolderDto: CreateFolderDto, userId: string) {
    const folderWithName = await this.folderRepository.find({
      where: {
        name: createFolderDto.name,
        parentFolderId: createFolderDto?.parentFolderId ?? null
      }
    })
    if (folderWithName?.length) {
      return new BadRequestException(`Folder with name "${createFolderDto.name} is already exist!`);
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
    }
  }

  async getRootFolders(userId: string): Promise<IResponseFolder[]> {
    const folders = await this.folderRepository.find({
      where: { userId, parentFolderId: IsNull() },
    })
    return folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      parentFolderId: folder.parentFolderId ?? null,
    }))
  }

  async getFolderContents(userId: string, folderId?: string) {
    const folder = await this.folderRepository.findOne({
      where: {
        id: folderId,
        userId,
        // parentFolderId: folderId ?? null
      },
      relations: ['files', 'subfolders']
    });
    return {
      id: folder.id,
      name: folder.name,
      parentFolderId: folder.parentFolderId ?? null,
      files: folder.files.map(file => ({
        id: file.id,
        name: file.name,
        folder: null,
        size: file.size,
        createdAt: file.createdAt,
      }))
    }
  }

  async deleteFolder(userId: string, folderId: string) {
    const folder = await this.folderRepository.findOne({
      where: {
        userId,
        id: folderId,
      }
    });
    if (!folder) {
      throw new BadRequestException(`Folder ${folderId} not found`);
    }

    await this.folderRepository.delete(folderId);
    return {message: `Folder deleted successfully`}
  }

  async renameFolder(userId: string, folderId: string, newName: string) {
    const folder = await this.folderRepository.findOne({
      where: {
        userId,
        id: folderId
      }
    })

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
    })
    if (!folder) {
      throw new BadRequestException(`Folder ${folderId} not found`);
    }

    folder.parentFolderId = newParentFolderId;
    await this.folderRepository.save(folder);
    return folder;
  }
}
