import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/upload/cloudinary.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto, avatarFile?: Express.Multer.File) {
    const { firstName, lastName, email, password, phone } = registerDto;

    if (!firstName || !lastName || !email || !password || !phone) {
      throw new BadRequestException('Missing required fields');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let avatarUrl: string | null = null;
    if (avatarFile) {
      try {
        const uploadResult = await this.cloudinaryService.uploadAvatar(
          avatarFile.buffer,
        );
        avatarUrl = uploadResult.secureUrl;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new BadRequestException(`Avatar upload failed: ${errorMessage}`);
      }
    }

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        avatar: avatarUrl,
        role: UserRole.USER,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    // ✅ No expiresIn passed - uses default '7d'
    const authToken = this.generateToken(user.id, user.email, user.role);

    return {
      success: true,
      message: 'Account created successfully',
      authToken,
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, rememberMe } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // ✅ Pass expiresIn when needed
    const expiresIn = rememberMe ? '30d' : '7d';
    const authToken = this.generateToken(
      user.id,
      user.email,
      user.role,
      expiresIn,
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful',
      authToken,
      user: userWithoutPassword,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        dateOfBirth: true,
        gender: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  // ✅ FIXED: Make expiresIn optional with default value
  private generateToken(
    userId: string,
    email: string,
    role: UserRole,
    expiresIn: '7d' | '30d' = '7d', // ✅ Optional with default
  ): string {
    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET not set');
    }

    // ✅ Option 1: Pass string directly
    const options: SignOptions = {
      expiresIn,
    };

    return jwt.sign({ userId, email, role }, secret, options);
  }
}

// ==================== SUMMARY ====================
/*

✅ CORRECT USAGE:

1. In register() - No expiresIn needed
   const authToken = this.generateToken(user.id, user.email, user.role);
   // Uses default '7d'

2. In login() - Pass expiresIn for rememberMe
   const expiresIn = rememberMe ? '30d' : '7d';
   const authToken = this.generateToken(
     user.id,
     user.email,
     user.role,
     expiresIn,
   );

✅ KEY CHANGES:

- Changed: expiresIn: '7d'
- To: expiresIn: '7d' | '30d' = '7d'
  
The = '7d' at the end makes it optional with a default value

*/
