import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';

@Controller(':userId/folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post('create')
  createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @Param('userId') userId: string
  ) {
    return this.foldersService.createFolder(createFolderDto, userId);
  }

  @Get(':folderId')
  getFolderContents(@Param('userId') userId: string, @Param('folderId') folderId?: string) {
    return this.foldersService.getFolderContents(userId, folderId);
  }

  @Delete(':folderId')
  deleteFolder(@Param('userId') userId: string, @Param('folderId') folderId: string) {
    return this.foldersService.deleteFolder(userId, folderId);
  }

  @Post(':folderId/rename')
  renameFolder(
    @Body() newName: string,
    @Param('userId') userId: string,
    @Param('folderId') folderId: string
  ) {
    return this.foldersService.renameFolder(userId, folderId, newName);
  }

  @Post(':folderId/move')
  moveFolder(
    @Param('userId') userId: string,
    @Param('folderId') folderId: string,
    @Body() newParentFolderId: string,
  ) {
    return this.foldersService.moveFolder(userId, folderId, newParentFolderId);
  }

  @Get('')
  getRootFolders(
    @Param('userId') userId: string
  ) {
    return this.foldersService.getRootFolders(userId);
  }
}
