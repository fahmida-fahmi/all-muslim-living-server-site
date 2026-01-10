import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator to protect routes by user role
 * @param roles - Array of allowed roles
 * @example
 * @Roles('ADMIN', 'EMPLOYER')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async createJob() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// ============================================
// USAGE EXAMPLES
// ============================================

/*
Example 1: Only ADMIN can access
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async adminRoute() {
  return { message: 'Admin access granted' };
}

Example 2: EMPLOYER or ADMIN can access
@Post('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('EMPLOYER', 'ADMIN')
async createJob(@Body() createJobDto: CreateJobDto) {
  return this.jobsService.create(createJobDto);
}

Example 3: Multiple roles
@Put('users/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'EMPLOYER', 'ADMIN')
async updateUser(@Param('id') id: string) {
  return this.usersService.update(id);
}

Example 4: No roles required (any authenticated user)
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@Request() req) {
  return req.user;
}
*/
