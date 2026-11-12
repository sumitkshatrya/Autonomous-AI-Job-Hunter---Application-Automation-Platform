import dotenv from 'dotenv';
import dns from 'dns';
import fs from 'fs';

// Ensure Windows Node.js resolves MongoDB Atlas SRV records and Google APIs reliably
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setting servers is restricted
}

dotenv.config();
if (fs.existsSync('./server/.env')) {
  dotenv.config({ path: './server/.env' });
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/autoapply-ai',
  jwtSecret: process.env.JWT_SECRET || 'dev_super_secret_jwt_key_autoapply_ai_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  encryptionKey:
    process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', // 32 bytes hex
  ai: {
    provider: (process.env.AI_PROVIDER || 'gemini').toLowerCase(), // 'gemini' or 'openai'
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
  },
  email: {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '465', 10),
    smtpSecure: process.env.SMTP_SECURE !== 'false',
    smtpUser: process.env.SMTP_USER || process.env.GMAIL_USER || '',
    smtpPass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '',
    fromAddress: process.env.NOTIFICATION_FROM_EMAIL || 'skumar21082001@gmail.com',
    fromName: process.env.NOTIFICATION_FROM_NAME || 'AutoApply AI Autopilot',
  },
  whatsapp: {
    apiEndpoint: process.env.WHATSAPP_API_ENDPOINT || 'https://graph.facebook.com/v21.0',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    wabaId: process.env.WHATSAPP_WABA_ID || '',
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'autoapply_whatsapp_verify_token_2026',
    callMeBotApiKey: process.env.CALLMEBOT_API_KEY || '',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  storage: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
};
