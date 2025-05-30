import { IsEmail, Length } from 'class-validator';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Shelf } from './shelf.entity';
import { Review } from './review.entity';
import { BetterreadRole } from '../../rest/utils/roles/roles.decorator';
import { History } from './history.entity';

@Entity('app_user')
export class User {
  @PrimaryGeneratedColumn({ name: 'app_user_id' })
  id: number;

  @Column({ length: 50 })
  @Length(2, 50)
  name: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  password: string;

  @Column({ name: 'user_role' })
  role: BetterreadRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Promise<Review[]>;

  @OneToMany(() => Shelf, (shelf) => shelf.user)
  shelves: Promise<Shelf[]>;

  @OneToMany(() => History, (history) => history.user)
  history: Promise<History[]>;

  constructor(name: string, email: string, password: string, role: BetterreadRole, createdAt: Date, updatedAt: Date) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
