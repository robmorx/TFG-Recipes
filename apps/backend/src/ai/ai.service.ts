import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  async generate(prompt: string): Promise<{
    name: string;
    ingredients: string[];
    steps: string[];
  }> {
    const model = this.configService.get<string>('GEMINI_MODEL') || 'gemini-3-flash';

    const result = await this.ai.models.generateContent({
      model,
      contents: `Generate a recipe: ${prompt}. Return ONLY a valid JSON object with this exact structure: {"name": "string", "ingredients": ["string"], "steps": ["string"]}. No additional text.`,
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
              items: { type: 'string' },
            },
          },
          required: ['name', 'ingredients', 'steps'],
        },
      },
    });

    const text = result.text || '{}';
    let parsed: { name: string; ingredients: string[]; steps: string[] };

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { name: 'Generated Recipe', ingredients: [], steps: [] };
    }

    return {
      name: parsed.name || 'Generated Recipe',
      ingredients: parsed.ingredients || [],
      steps: parsed.steps || [],
    };
  }
}