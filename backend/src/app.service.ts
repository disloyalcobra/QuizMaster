import { Injectable } from '@nestjs/common';

/**
 * AppService: Servicio base que provee lógica simple de respuesta para el controlador raíz.
 */
@Injectable()
export class AppService {
  /**
   * Devuelve un mensaje de saludo inicial.
   */
  getHello(): string {
    return '🚀 QuizMaster Pro API activa y lista.';
  }
}
