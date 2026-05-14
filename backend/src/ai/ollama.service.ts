import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class OllamaService {
  private readonly baseUrl = 'http://localhost:11434/api/generate';
  private readonly model = 'qwen2.5:3b';

  /**
   * Intenta reparar un JSON truncado extrayendo las preguntas completas.
   * Útil cuando el modelo se queda sin tokens y corta el JSON a la mitad.
   */
  private repairTruncatedJson(text: string): any | null {
    try {
      // Estrategia 1: buscar y cerrar el JSON incompleto
      const arrayStart = text.indexOf('"preguntas"');
      if (arrayStart === -1) return null;

      // Encontrar el inicio del array de preguntas
      const bracketStart = text.indexOf('[', arrayStart);
      if (bracketStart === -1) return null;

      // Recopilar solo objetos de pregunta completamente cerrados
      const preguntas: any[] = [];
      let depth = 0;
      let objStart = -1;

      for (let i = bracketStart; i < text.length; i++) {
        if (text[i] === '{') {
          if (depth === 0) objStart = i;
          depth++;
        } else if (text[i] === '}') {
          depth--;
          if (depth === 0 && objStart !== -1) {
            const candidate = text.substring(objStart, i + 1);
            try {
              const parsed = JSON.parse(candidate);
              if (parsed.texto && parsed.respuestas) {
                parsed.orden = preguntas.length + 1;
                preguntas.push(parsed);
              }
            } catch {
              // Ignorar objetos malformados
            }
            objStart = -1;
          }
        }
      }

      return preguntas.length > 0 ? { preguntas } : null;
    } catch {
      return null;
    }
  }

  async generateQuiz(prompt: string, numQuestions: number = 5): Promise<any> {
    const systemPrompt = `Eres un experto creador de cuestionarios educativos de alta calidad.
Tu tarea es generar exactamente ${numQuestions} preguntas en formato JSON estricto.

### REGLAS DE CALIDAD:
1. Genera preguntas CORTAS y DIRECTAS. El texto de la pregunta debe ser máximo 15 palabras.
2. Las opciones de respuesta también deben ser BREVES (máximo 6 palabras cada una).
3. Genera preguntas relevantes y variadas sobre el tema solicitado.
4. NO generes preguntas sobre el formato del quiz, colores o metadatos.
5. NO uses puntos suspensivos ("...") ni marcadores de posición. Todo debe estar completo.
6. Para "multiple", genera siempre 4 opciones coherentes y distintas entre sí.
7. Para "verdadero_falso", genera exactamente 2 opciones: "Verdadero" y "Falso".

### REGLAS TÉCNICAS:
1. Devuelve ÚNICAMENTE el objeto JSON. Sin bloques markdown (\`\`\`json) ni texto extra.
2. El campo "tipoPregunta" debe ser "multiple" o "verdadero_falso".
3. Colores: Opcion 1 (#ef4444), 2 (#3b82f6), 3 (#22c55e), 4 (#f59e0b).
4. EXACTAMENTE una respuesta debe tener "esCorrecta": true en cada pregunta.

### ESTRUCTURA:
{
  "preguntas": [
    {
      "texto": "¿Pregunta breve?",
      "tipoPregunta": "multiple",
      "orden": 1,
      "tiempoLimite": 20,
      "puntosValor": 100,
      "explicacion": "Razon breve.",
      "respuestas": [
        { "texto": "Opcion A", "esCorrecta": true, "orden": 1, "color": "#ef4444" },
        { "texto": "Opcion B", "esCorrecta": false, "orden": 2, "color": "#3b82f6" },
        { "texto": "Opcion C", "esCorrecta": false, "orden": 3, "color": "#22c55e" },
        { "texto": "Opcion D", "esCorrecta": false, "orden": 4, "color": "#f59e0b" }
      ]
    }
  ]
}`;

    const userPrompt = `Crea ${numQuestions} preguntas cortas y variadas sobre el tema: ${prompt}`;

    try {
      console.log(`[Ollama] Generando ${numQuestions} preguntas para el tema: ${prompt}...`);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: userPrompt,
          system: systemPrompt,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.2,
            num_predict: -1, // Sin límite — evita truncamiento del JSON
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Error de red con Ollama: ${response.status} ${response.statusText}`);
      }

      const rawResponse = await response.json();
      let responseText = (rawResponse.response || '').trim();
      
      // Limpieza 1: eliminar bloques markdown accidentales
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      // Limpieza 2: extraer solo el objeto JSON si hay texto antes/después
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        responseText = responseText.substring(jsonStart, jsonEnd + 1);
      }

      try {
        const parsedJSON = JSON.parse(responseText);
        
        if (!parsedJSON.preguntas || !Array.isArray(parsedJSON.preguntas) || parsedJSON.preguntas.length === 0) {
          throw new Error('El JSON no contiene preguntas válidas.');
        }

        console.log(`[Ollama] ✅ Quiz generado: ${parsedJSON.preguntas.length} preguntas.`);
        return parsedJSON;
      } catch (parseError: any) {
        console.warn('[Ollama] ⚠️ JSON inválido, intentando reparación...');
        console.error('[Ollama] Fragmento recibido:', responseText.substring(0, 400));

        // Intentar rescatar preguntas completas del JSON truncado
        const repaired = this.repairTruncatedJson(responseText);
        if (repaired) {
          console.log(`[Ollama] 🔧 JSON reparado: ${repaired.preguntas.length} preguntas recuperadas.`);
          return repaired;
        }

        throw new Error(`La IA no pudo generar un formato válido. Intenta con un prompt más simple.`);
      }
    } catch (error: any) {
      console.error('[Ollama] Error crítico:', error.message);
      
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        throw new InternalServerErrorException('No se pudo conectar con Ollama. Asegúrate de que la aplicación esté abierta en tu computadora.');
      }
      
      throw new InternalServerErrorException(error.message || 'Error desconocido al generar el quiz con IA.');
    }
  }
}
