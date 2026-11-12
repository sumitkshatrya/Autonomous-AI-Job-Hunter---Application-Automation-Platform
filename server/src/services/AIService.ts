import axios from 'axios';
import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';

export class AIService {
  private static instance: AIService;
  private openai: OpenAI | null = null;
  private geminiQuotaExceededUntil: number = 0;

  private constructor() {
    if (config.openai.apiKey) {
      this.openai = new OpenAI({ apiKey: config.openai.apiKey });
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generates a structured JSON response from Gemini or OpenAI
   */
  public async generateJSON<T = any>(
    systemPrompt: string,
    userPrompt: string,
    fallback?: () => T
  ): Promise<T> {
    const provider = config.ai.provider;

    // 1. Google Gemini Provider
    if (
      provider === 'gemini' &&
      config.ai.geminiApiKey &&
      (!this.geminiQuotaExceededUntil || Date.now() > this.geminiQuotaExceededUntil)
    ) {
      try {
        const model = config.ai.geminiModel || 'gemini-3.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.ai.geminiApiKey}`;

        const promptText = `${systemPrompt}\n\nIMPORTANT: You MUST respond ONLY with a single valid JSON object. Do not include markdown code block syntax (like \`\`\`json).\n\nUser request:\n${userPrompt}`;

        const response = await axios.post(
          url,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          },
          { timeout: 4000 }
        );

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
          return JSON.parse(cleaned) as T;
        }
      } catch (err: any) {
        const msg = err.response?.data?.error?.message || err.message || '';
        if (err.response?.status === 429 || msg.includes('quota') || msg.includes('Quota exceeded')) {
          this.geminiQuotaExceededUntil = Date.now() + 60 * 60 * 1000;
          logger.warn(`Gemini API quota reached. Operating seamlessly with high-performance deterministic templates & fallback logic.`);
        } else {
          logger.warn(`Gemini generateJSON error: ${msg}`);
        }
      }
    }

    // 2. OpenAI Provider
    if (provider === 'openai' && this.openai && config.openai.apiKey) {
      try {
        const response = await this.openai.chat.completions.create({
          model: config.openai.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as T;
        }
      } catch (err: any) {
        logger.warn(`OpenAI generateJSON error: ${err.message}`);
      }
    }

    // 3. Fallback heuristic
    if (fallback) {
      return fallback();
    }
    throw new Error('AI generation failed and no fallback provided');
  }

  /**
   * Generates plaintext response (e.g. cover letter or email outreach)
   */
  public async generateText(
    systemPrompt: string,
    userPrompt: string,
    fallback?: () => string
  ): Promise<string> {
    const provider = config.ai.provider;

    // 1. Google Gemini Provider
    if (
      provider === 'gemini' &&
      config.ai.geminiApiKey &&
      (!this.geminiQuotaExceededUntil || Date.now() > this.geminiQuotaExceededUntil)
    ) {
      try {
        const model = config.ai.geminiModel || 'gemini-3.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.ai.geminiApiKey}`;

        const response = await axios.post(
          url,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
            },
          },
          { timeout: 4000 }
        );

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text.trim();
        }
      } catch (err: any) {
        const msg = err.response?.data?.error?.message || err.message || '';
        if (err.response?.status === 429 || msg.includes('quota') || msg.includes('Quota exceeded')) {
          this.geminiQuotaExceededUntil = Date.now() + 60 * 60 * 1000;
          logger.warn(`Gemini API quota reached. Operating seamlessly with high-performance deterministic templates & fallback logic.`);
        } else {
          logger.warn(`Gemini generateText error: ${msg}`);
        }
      }
    }

    // 2. OpenAI Provider
    if (provider === 'openai' && this.openai && config.openai.apiKey) {
      try {
        const response = await this.openai.chat.completions.create({
          model: config.openai.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
        });

        const text = response.choices[0]?.message?.content?.trim();
        if (text) {
          return text;
        }
      } catch (err: any) {
        logger.warn(`OpenAI generateText error: ${err.message}`);
      }
    }

    // 3. Fallback
    if (fallback) {
      return fallback();
    }
    return '';
  }

  /**
   * Generates a vector embedding for semantic matching
   */
  public async generateEmbedding(text: string): Promise<number[] | null> {
    const provider = config.ai.provider;

    // 1. Gemini Embedding
    if (provider === 'gemini' && config.ai.geminiApiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${config.ai.geminiApiKey}`;
        const response = await axios.post(
          url,
          {
            content: { parts: [{ text: text.slice(0, 8000) }] },
          },
          { timeout: 4000 }
        );
        return response.data?.embedding?.values || null;
      } catch (err: any) {
        logger.debug(`Gemini embedding notice: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    // 2. OpenAI Embedding
    if (provider === 'openai' && this.openai && config.openai.apiKey) {
      try {
        const res = await this.openai.embeddings.create({
          model: config.openai.embeddingModel,
          input: text.slice(0, 8000),
        });
        return res.data[0].embedding;
      } catch (err: any) {
        logger.debug(`OpenAI embedding notice: ${err.message}`);
      }
    }

    return null;
  }
}

