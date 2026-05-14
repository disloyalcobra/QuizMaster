import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() data: { avatarUrl?: string }) {
    const userId = req.user.id;
    const { passwordHash, ...user } = await this.usersService.update(userId, {
      ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
    });
    return user;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUsers(@Req() req: any) {
    if (req.user.rol !== 'admin') throw new UnauthorizedException('Solo admins pueden ver los usuarios');
    const users = await this.usersService.findAll();
    return users.map(({ passwordHash, ...u }) => u);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createUser(@Req() req: any, @Body() data: any) {
    if (req.user.rol !== 'admin') throw new UnauthorizedException('Solo admins pueden crear usuarios');
    const { nombre, email, password, rol } = data;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      nombre,
      email,
      passwordHash,
      rol: rol || 'creador',
    });
    const { passwordHash: _, ...userNoPass } = user;
    return userNoPass;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    if (req.user.rol !== 'admin') throw new UnauthorizedException('Solo admins pueden editar usuarios');
    
    const updateData: any = { ...data };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }
    
    // Evitamos pisar el ID si viene en el payload
    delete updateData.id;

    const user = await this.usersService.update(id, updateData);
    const { passwordHash: _, ...userNoPass } = user;
    return userNoPass;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: any, @Param('id') id: string) {
    if (req.user.rol !== 'admin') throw new UnauthorizedException('Solo admins pueden eliminar usuarios');
    if (req.user.id === id) throw new UnauthorizedException('No puedes eliminarte a ti mismo');
    
    await this.usersService.remove(id);
    return { success: true };
  }
}

