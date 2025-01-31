import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get('/')
  getAllUsers() {}

  @Get('/:id')
  getUserById() {}

  @Post('/')
  createUser() {}
}
