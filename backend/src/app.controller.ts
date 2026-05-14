import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * AppController: Controlador raíz que maneja peticiones administrativas básicas.
 * Se utiliza principalmente para comprobaciones de estado o salud de la API.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Ruta GET inicial: Retorna un saludo de bienvenida.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
