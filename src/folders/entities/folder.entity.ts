import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { File } from '../../files/entities/file.entity';

@Entity({name: 'folders', schema: 'misafiles_schema'})
export class Folder {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsNotEmpty()
  @Column()
  name: string;

  @Column({nullable: true})
  parentFolderId: string | null;

  @Column()
  userId: string;

  @OneToMany(() => File, (file) => file.folder, { cascade: true })
  files: File[];

  @OneToMany(() => Folder, (folder) => folder.parentFolder, {cascade: true})
  subfolders: Folder[];

  @ManyToOne(
    () => Folder,
    (folder) => folder.subfolders, { nullable: true, onDelete: 'CASCADE'}
  )
  parentFolder: Folder | null;
}
