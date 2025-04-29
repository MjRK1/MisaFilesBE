import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
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
    return this.foldersService.createFolder(createFolderDto, String(req['user'].sub));
  }

  @Get('')
  getFolderContents(
    @Req() req: Request,
    @Query('folderId') folderId?: string
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
    @Body() body: {newName: string},
    @Req() req: Request,
    @Param('folderId') folderId: string
  ) {
    return this.foldersService.renameFolder(req['user'].sub, folderId, body.newName);
  }

  @Post('move')
  moveFolder(
    @Req() req: Request,
    @Body() body: {newParentFolderId?: string | null, folderId: string},
  ) {
    return this.foldersService.moveFolder(req['user'].sub, body.folderId, body.newParentFolderId);
  }

  @Get('resolve')
  resolvePath(
    @Req() req: Request,
    @Query('path') path: string
  ) {
    return this.foldersService.resolvePath(req['user'].sub, path);
  }
}
