import { NotFoundException } from '@nestjs/common';

export class ArtistNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`No se encontró el artista con id ${id}`);
  }
}
