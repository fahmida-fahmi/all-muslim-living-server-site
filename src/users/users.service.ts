import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { UpdateUserDto } from './dto';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //  Create new user
  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        dateOfBirth: createUserDto.dateOfBirth
          ? new Date(createUserDto.dateOfBirth)
          : null,
        role: createUserDto.role || "USER",
      },
    });

    const { password, ...result } = user;
    return result
  }

  //  Get all users
  async getAllUsers(page = 1, limit= 10) {
    const skip = (page -1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip, 
        take: limit,
        orderBy: { createdAt: 'desc'},
        select:{
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true, 
          avatar: true,
          dateOfBirth: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        
      }),
      this.prisma.user.count(),
    ])
    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil( total / limit),
      }
    }
  }

  //  Get user by ID
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {id},
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        dateOfBirth: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if(!user) {
      throw new ConflictException('User not found');
    }
    return user;
  }

  //update user by id 

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    await this.getUserById(id);

    if(updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where:{id},
      data: {
        ...updateUserDto,
        dateOfBirth: updateUserDto.dateOfBirth ? new Date(updateUserDto.dateOfBirth) : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        dateOfBirth: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });
    return user;

  }

  async remove( id: string ) {
    const existingUser = await this.getUserById( id );


    await this.prisma.user.delete({
      where: {id}
    });
    return {
      message: 'User deleted successfully'
    }
  }

  


}
