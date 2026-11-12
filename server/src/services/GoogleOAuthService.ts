import { config } from '../config';
import { EmailAccount, IEmailAccountDocument } from '../models/EmailAccount';
import { encrypt, decrypt } from '../utils/crypto';
import { logger } from '../utils/logger';

// Use dynamic require to avoid loading 200MB+ of unused Google API type definitions during compile
const { google } = require('googleapis');

export class GoogleOAuthService {
  private static instance: GoogleOAuthService;

  private constructor() {}

  public static getInstance(): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService();
    }
    return GoogleOAuthService.instance;
  }

  private getOAuth2Client() {
    if (!config.google.clientId || !config.google.clientSecret) {
      throw new Error('Google OAuth credentials not configured in environment (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).');
    }

    return new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
  }

  /**
   * Generates authorization URL for Google / Gmail connection
   */
  public getAuthUrl(userId?: string): string {
    const oauth2Client = this.getOAuth2Client();

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: userId || '',
    });
  }

  /**
   * Exchanges authorization code for tokens and persists encrypted credentials
   */
  public async handleCallback(code: string, stateUserId?: string): Promise<{
    emailAddress: string;
    account: IEmailAccountDocument;
  }> {
    const oauth2Client = this.getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user's Google profile information
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const emailAddress = userInfo.data.email;

    if (!emailAddress) {
      throw new Error('Could not retrieve email address from Google OAuth profile.');
    }

    const accessTokenEncrypted = tokens.access_token ? encrypt(tokens.access_token) : undefined;
    const refreshTokenEncrypted = tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined;
    const tokenExpiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : undefined;

    // Upsert into EmailAccount collection
    const account = await EmailAccount.findOneAndUpdate(
      {
        ...(stateUserId ? { userId: stateUserId } : {}),
        emailAddress: emailAddress.toLowerCase().trim(),
      },
      {
        ...(stateUserId ? { userId: stateUserId } : {}),
        provider: 'gmail',
        emailAddress: emailAddress.toLowerCase().trim(),
        accessTokenEncrypted,
        ...(refreshTokenEncrypted ? { refreshTokenEncrypted } : {}),
        tokenExpiresAt,
        isActive: true,
        isPrimary: true,
      },
      { upsert: true, new: true }
    );

    logger.info(`Google Gmail account connected successfully: ${emailAddress} (User: ${stateUserId || 'anonymous'})`);

    return { emailAddress, account };
  }

  /**
   * Creates an authorized OAuth2 client from saved EmailAccount document
   */
  public async getAuthenticatedClient(account: IEmailAccountDocument) {
    const oauth2Client = this.getOAuth2Client();

    if (!account.accessTokenEncrypted) {
      throw new Error('EmailAccount has no encrypted access token.');
    }

    const accessToken = decrypt(account.accessTokenEncrypted);
    const refreshToken = account.refreshTokenEncrypted ? decrypt(account.refreshTokenEncrypted) : undefined;

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: account.tokenExpiresAt ? account.tokenExpiresAt.getTime() : undefined,
    });

    // Handle token refresh if token expired or about to expire in 5 minutes
    if (account.tokenExpiresAt && account.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
      if (refreshToken) {
        try {
          const newTokens = await oauth2Client.refreshAccessToken();
          oauth2Client.setCredentials(newTokens.credentials);

          account.accessTokenEncrypted = encrypt(newTokens.credentials.access_token!);
          if (newTokens.credentials.refresh_token) {
            account.refreshTokenEncrypted = encrypt(newTokens.credentials.refresh_token);
          }
          if (newTokens.credentials.expiry_date) {
            account.tokenExpiresAt = new Date(newTokens.credentials.expiry_date);
          }
          await account.save();
          logger.info(`Refreshed Google OAuth token for ${account.emailAddress}`);
        } catch (err: any) {
          logger.warn(`Failed to refresh Google OAuth token: ${err.message}`);
        }
      }
    }

    return oauth2Client;
  }

  /**
   * Sends an email through Gmail API via authorized OAuth2
   */
  public async sendGmail(
    account: IEmailAccountDocument,
    options: {
      to: string;
      subject: string;
      body: string;
      fromName?: string;
    }
  ): Promise<{ messageId: string; threadId?: string }> {
    const authClient = await this.getAuthenticatedClient(account);
    const gmail = google.gmail({ version: 'v1', auth: authClient });

    const senderDisplay = options.fromName ? `"${options.fromName}" <${account.emailAddress}>` : account.emailAddress;

    const utf8Subject = `=?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`;
    const messageParts = [
      `From: ${senderDisplay}`,
      `To: ${options.to}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      options.body,
    ];
    const message = messageParts.join('\r\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    logger.info(`Email sent via Gmail API to ${options.to} (Message ID: ${res.data.id})`);

    // Increment daily usage
    account.emailsSentToday = (account.emailsSentToday || 0) + 1;
    await account.save();

    return {
      messageId: res.data.id || `gmail-${Date.now()}`,
      threadId: res.data.threadId || undefined,
    };
  }
}

