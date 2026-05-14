import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Asegurar que solo usuarios autenticados suban

/**
 * MediaController: Gestiona la subida de archivos multimedia (imágenes y audio).
 * Protegido por JWT para que solo creadores registrados puedan subir recursos.
 */
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * POST /media/upload: Recibe un archivo binario y lo sube a Supabase Storage.
   * Soporta imágenes (PNG/JPG) y audio (MP3).
   * Límite de tamaño: 10MB.
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB máximo
    },
    fileFilter: (req, file, cb) => {
      // Validamos mime types permitidos
      if (file.mimetype.match(/\/(jpeg|png|gif|mp3|mpeg|wav)$/)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Tipo de archivo no soportado. Sube imágenes o audios (MP3).'), false);
      }
    }
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string
  ) {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado');
    }

    // Delegamos la subida al servicio de medios
    const publicUrl = await this.mediaService.uploadFile(file, folder || 'general');
    return { url: publicUrl, success: true };
  }
}
