import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface Recipe {
  id: number;
  recipe_uuid: string;
  name: string;
  ingredients: string[];
  steps: string[];
  user_uuid: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

  async generate(prompt: string): Promise<Recipe> {
    const apiKey = this.configService.get<string>('AI_API_KEY');
    const model = this.configService.get<string>('AI_MODEL') || 'gpt-4';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: `Generate a recipe with the following details: ${prompt}. Return ONLY a valid JSON object with this exact structure: {"name": "string", "ingredients": ["string"], "steps": ["string"]}. No additional text.`,
          },
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    let parsed: { name: string; ingredients: string[]; steps: string[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { name: 'Generated Recipe', ingredients: [], steps: [] };
    }

    return {
      id: 0,
      recipe_uuid: crypto.randomUUID(),
      name: parsed.name,
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      user_uuid: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}