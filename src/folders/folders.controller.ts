import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post('create')
  createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @Req() req: Request,
  ) {
    return this.foldersService.createFolder(createFolderDto, req['user'].sub);
  }

  @Get(':folderId')
  getFolderContents(
    @Param('userId') userId: string,
    @Req() req: Request,
    @Param('folderId') folderId?: string
  ) {
    return this.foldersService.getFolderContents(req['user'].sub, folderId);
  }

  @Delete(':folderId')
  deleteFolder(
    @Req() req: Request,
    @Param('folderId') folderId: string
  ) {
    return this.foldersService.deleteFolder(req['user'].sub, folderId);
  }

  @Post(':folderId/rename')
  renameFolder(
    @Body() newName: string,
    @Req() req: Request,
    @Param('folderId') folderId: string
  ) {
    return this.foldersService.renameFolder(req['user'].sub, folderId, newName);
  }

  @Post(':folderId/move')
  moveFolder(
    @Req() req: Request,
    @Param('folderId') folderId: string,
    @Body() newParentFolderId: string,
  ) {
    return this.foldersService.moveFolder(req['user'].sub, folderId, newParentFolderId);
  }

  @Get('')
  getRootFolders(
    @Req() req: Request,
  ) {
    return this.foldersService.getRootFolders(req['user'].sub);
  }
}
