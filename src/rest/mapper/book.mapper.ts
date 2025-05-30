import { BookDto, SmallBookDto } from '../dto/book.dto';
import { Book } from '../../database/model/book.entity';
import authorMapper from './author.mapper';

class BookMapper {
  async toSmallBookDto(entity: Book): Promise<SmallBookDto> {
    return {
      id: entity.id,
      title: entity.title,
      isbn13: entity.isbn13,
      authors: authorMapper.toDtos((await entity.authors) ?? []),
    };
  }

  toSmallBookDtos(entities: Book[]): Promise<SmallBookDto[]> {
    return Promise.all(entities.map((entity) => this.toSmallBookDto(entity)));
  }

  async toBookDto(entity: Book): Promise<BookDto> {
    return {
      id: entity.id,
      title: entity.title,
      createdAt: entity.createdAt,
      genres: entity.genres,
      releaseDate: entity.releaseDate,
      isbn10: entity.isbn10,
      isbn13: entity.isbn13,
      editor: entity.editor,
      editionLanguage: entity.editionLanguage,
      description: entity?.description,
      authors: authorMapper.toDtos((await entity.authors) ?? []),
    };
  }

  toBookDtos(entities: Book[]): Promise<BookDto[]> {
    return Promise.all(entities.map((entity) => this.toBookDto(entity)));
  }
}

export default new BookMapper();
