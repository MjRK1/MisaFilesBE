import { Folder } from '../../folders/entities/folder.entity';

export interface IResponseFile {
  id: string;
  name: string;
  size: number;
  folder: Folder | null;
  createdAt: Date;
}