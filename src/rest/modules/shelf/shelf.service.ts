import { ForbiddenException, Injectable } from '@nestjs/common';
import { ShelfRepository } from '../../../database/shelf/shelf.repository';
import { Shelf, ShelfType } from '../../../database/model/shelf.entity';
import { ShelfNotFoundException } from './shelf.exceptions';
import { TransactionService } from '../../../database/utils/transaction/transaction.service';
import { BookRepository } from '../../../database/book/book.repository';
import { User } from '../../../database/model/user.entity';

@Injectable()
export class ShelfService {
  constructor(
    private readonly shelfRepository: ShelfRepository,
    private readonly bookRepository: BookRepository,
    private readonly transactionService: TransactionService,
  ) {}

  async getUserShelves(userId: number, amount?: number): Promise<Shelf[]> {
    const shelves = amount
      ? await this.shelfRepository.findLatestShelvesByUserId(userId, amount)
      : await this.shelfRepository.findShelvesByUserId(userId);
    return await Promise.all(
      shelves.map((shelf) => {
        shelf.books = this.bookRepository.findLastBooksOfShelf(shelf);
        return shelf;
      }),
    );
  }

  async getUserShelvesContainingBook(userId: number, bookId: number): Promise<Shelf[]> {
    return this.shelfRepository.findShelvesContainingBookByUserId(bookId, userId);
  }

  async getUserReadingStatusShelves(userId: number): Promise<Shelf[]> {
    const shelves = await this.shelfRepository.findByUserIdAndTypeIn(userId, [
      ShelfType.READING,
      ShelfType.READ,
      ShelfType.TO_READ,
    ]);
    if (shelves.length === 0) {
      throw new ShelfNotFoundException();
    }
    return await Promise.all(
      shelves.map((shelf) => {
        shelf.books = this.bookRepository.findLastBooksOfShelf(shelf);
        return shelf;
      }),
    );
  }

  getAllShelves(): Promise<Shelf[]> {
    return this.shelfRepository.findAll();
  }

  async getShelfById(userId: number, shelfId: number): Promise<Shelf> {
    const shelf = await this.shelfRepository.findById(shelfId);
    if (!shelf) {
      throw new ShelfNotFoundException();
    }
    const shelfUserId = (await shelf.user).id;
    if (userId !== shelfUserId) {
      throw new ForbiddenException();
    }

    return shelf;
  }

  async createShelf(name: string, type: ShelfType, user: User): Promise<Shelf[]> {
    const newShelf = new Shelf(name, type, new Date(), new Date(), user);
    await this.shelfRepository.save(newShelf);

    return this.shelfRepository.findShelvesByUserId(user.id);
  }

  async removeShelf(userId: number, shelfId: number): Promise<Shelf> {
    const shelf = await this.shelfRepository.findById(shelfId);
    if (!shelf) {
      throw new ShelfNotFoundException();
    }
    if (shelf.type === ShelfType.TO_READ || shelf.type === ShelfType.READING || shelf.type === ShelfType.READ) {
      throw new ForbiddenException();
    }
    const shelfUserId = (await shelf.user).id;
    if (userId !== shelfUserId) {
      throw new ForbiddenException();
    }

    return this.shelfRepository.remove(shelf);
  }

  async updateShelfName(userId: number, shelfId: number, updatedShelfName: string): Promise<Shelf> {
    const shelf = await this.shelfRepository.findById(shelfId);
    if (!shelf) {
      throw new ShelfNotFoundException();
    }
    const shelfUserId = (await shelf.user).id;
    if (userId !== shelfUserId) {
      throw new ForbiddenException();
    }

    shelf.name = updatedShelfName;

    return this.shelfRepository.save(shelf);
  }
}
