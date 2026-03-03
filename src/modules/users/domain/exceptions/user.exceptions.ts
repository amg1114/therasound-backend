import { BadRequestException, NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
  }
}

export class UserPasswordMismatchException extends BadRequestException {
  constructor() {
    super(`Current password is incorrect`);
  }
}
