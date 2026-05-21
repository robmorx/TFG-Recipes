import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import {
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  async generate(prompt: string): Promise<{
    name: string;
    ingredients: string[];
    steps: { instruction: string; timerMinutes: number }[];
  }> {
    try {
      const model =
        this.configService.get<string>('GEMINI_MODEL') || 'gemini-3-flash';

      const result = await this.ai.models.generateContent({
        model,
        contents: `Actúa como un chef experto y generador de datos JSON. Tu tarea es generar una receta en ESPAÑOL siguiendo estas reglas estrictas:

1. **Restricción de Ingredientes:** Utiliza ÚNICAMENTE los ingredientes proporcionados en la lista del usuario y elementos básicos de despensa (aceite, sal, pimienta y agua). Está terminantemente PROHIBIDO inventar o añadir cualquier otro alimento, proteína, vegetal o condimento que no figure en la lista.
2. **Control Vegano:** Si el usuario indica preferencia "Vegano", debes omitir automáticamente cualquier ingrediente de la lista que sea de origen animal (carnes, lácteos, huevos, miel, etc.). No los sustituyas por otros alimentos, simplemente crea la receta con los ingredientes vegetales restantes.
3. **Formato de Salida:** Devuelve exclusivamente un objeto JSON válido. No incluyas explicaciones, no incluyas el bloque de marcado \`\`\`json \`\`\`, ni texto adicional antes o después del objeto.

Estructura exacta del JSON:
{
  "name": "Nombre creativo y descriptivo de la receta",
  "ingredients": ["lista de strings con los ingredientes exactos usados"],
  "steps": [
    {
      "instruction": "Explicación clara del paso",
      "timerMinutes": número_entero_o_cero
    }
  ]
}

Datos de entrada:
- Lista de ingredientes: \${prompt}
- Preferencia dietética: \${dietaryPreference}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              ingredients: {
                type: 'array',
                items: { type: 'string' },
              },
              steps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    instruction: { type: 'string' },
                    timerMinutes: {
                      type: 'number',
                      description:
                        'Minutes needed for this step. 0 if no timer.',
                    },
                  },
                  required: ['instruction', 'timerMinutes'],
                },
              },
            },
            required: ['ingredients', 'steps'],
          },
        },
      });

      const text = result.text || '{}';
      let parsed: {
        name: string;
        ingredients: string[];
        steps: Array<{ instruction: string; timerMinutes: number }>;
      };

      try {
        const parsedResult = JSON.parse(text) as {
          name: string;
          ingredients: string[];
          steps: Array<{ instruction: string; timerMinutes: number }>;
        };
        parsed = parsedResult;
      } catch (parseError) {
        this.logger.error('Failed to parse AI response as JSON', parseError);
        throw new BadRequestException('AI generated invalid response format');
      }

      // Validate structure
      if (!parsed.name || typeof parsed.name !== 'string') {
        throw new BadRequestException('AI response missing valid name');
      }

      if (
        !Array.isArray(parsed.ingredients) ||
        parsed.ingredients.length === 0
      ) {
        throw new BadRequestException('AI response missing ingredients');
      }

      if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        throw new BadRequestException('AI response missing steps');
      }

      // Validate each step
      const validSteps = parsed.steps.map((step, index: number) => {
        if (!step || typeof step.instruction !== 'string') {
          throw new BadRequestException(
            `Invalid step ${index + 1}: missing instruction`,
          );
        }
        return {
          instruction: step.instruction,
          timerMinutes:
            typeof step.timerMinutes === 'number' ? step.timerMinutes : 0,
        };
      });

      return {
        name: parsed.name,
        ingredients: parsed.ingredients.filter(
          (i): i is string => typeof i === 'string',
        ),
        steps: validSteps,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Gemini API call failed', error);
      throw new InternalServerErrorException('Failed to generate recipe');
    }
  }
}
