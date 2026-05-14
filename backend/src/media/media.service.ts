import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * MediaService: Servicio encargado del almacenamiento de archivos.
 * Utiliza Supabase Storage para persistir imágenes de perfil, portadas de quizzes y audios MP3.
 */
@Injectable()
export class MediaService {
  private supabase: SupabaseClient;
  private readonly bucket = 'quiz-media'; // Nombre del bucket en Supabase
  private readonly logger = new Logger(MediaService.name);

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Las credenciales de Supabase no están configuradas.');
    }

    // Inicialización del cliente de Supabase para manejo de Storage
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Sube un archivo a Supabase Storage y devuelve la URL pública.
   * @param file Archivo recibido de Multer
   * @param folder Carpeta dentro del bucket (opcional, ej: 'audios', 'images')
   */
  async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Error subiendo el archivo: ${error.message}`);
      throw new InternalServerErrorException('Error al subir el archivo a Supabase');
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }
}
