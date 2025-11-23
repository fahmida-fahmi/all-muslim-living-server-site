import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Express, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      // ✅ FIXED: Callback always needs TWO arguments: (error, acceptFile)
      fileFilter: (
        req: ExpressRequest,
        file: Express.Multer.File,
        // ✅ Note: callback requires both error AND acceptFile
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        // ✅ FIXED: Check if file exists
        if (!file) {
          cb(new BadRequestException('No file provided'), false); // ✅ 2 arguments
          return;
        }

        // ✅ FIXED: Always pass both arguments to cb
        if (!allowedMimes.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Invalid file type. Only JPG and PNG allowed',
            ),
            false, // ✅ Second argument: reject file
          );
          return;
        }

        // ✅ FIXED: Check file.size with proper null safety
        if (file.size > maxSize) {
          cb(
            new BadRequestException('File size exceeds 5MB limit'),
            false, // ✅ Second argument: reject file
          );
          return;
        }

        // ✅ FIXED: Accept file - null for error, true to accept
        cb(null, true); // ✅ First arg: null (no error), Second arg: true (accept)
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.register(registerDto, file);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    if (!req.user || !req.user.userId) {
      throw new BadRequestException('User not found in request');
    }
    return this.authService.getProfile(req.user.userId);
  }
}

// ==================== CALLBACK CHEAT SHEET ====================
/*

The cb() callback in multer ALWAYS needs 2 arguments:

✅ CORRECT PATTERNS:

1. REJECT - Invalid type
   cb(new BadRequestException('...'), false);

2. REJECT - File too large
   cb(new BadRequestException('...'), false);

3. ACCEPT - File is good
   cb(null, true);

4. ERROR - Unexpected error
   cb(new Error('Unexpected error'), false);

❌ WRONG PATTERNS:

1. Only passing error (WRONG!)
   cb(new BadRequestException('...'));  // Missing 2nd argument!

2. No arguments (WRONG!)
   cb();  // Missing both arguments!

3. Only passing true/false (WRONG!)
   cb(true);  // Missing error argument!

REMEMBER: cb(error, acceptFile)
  - First param: Error object (or null if no error)
  - Second param: Boolean - true to accept, false to reject

*/
