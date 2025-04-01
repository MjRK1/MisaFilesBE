import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Folder } from '../../folders/entities/folder.entity';

@Entity({name: 'files', schema: 'misafiles_schema'})
export class File {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string

  @Column()
  size: number;

  @Column()
  mimeType: string;

  @Column()
  path: string;

  @Column({nullable: true})
  thumbnailPath: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Folder, (folder) => folder.files, { onDelete: 'SET NULL'})
  folder: Folder | null;
}