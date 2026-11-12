import { config } from '../config';
import { Application } from '../models/Application';
import { Notification } from '../models/Notification';
import { OutreachMessage } from '../models/OutreachMessage';
import {
  EmailReplyClassification,
  IExtractedInterviewDetails,
} from '@autoapply/shared';
import { AIService } from './AIService';
import { logger } from '../utils/logger';

export class EmailMonitoringService {
  private aiService: AIService;

  constructor() {
    this.aiService = AIService.getInstance();
  }

  /**
   * Classifies email replies from recruiters and extracts critical action items
   */
  public async classifyEmailReply(
    senderEmail: string,
    subject: string,
    body: string
  ): Promise<{
    classification: EmailReplyClassification;
    confidence: number;
    extractedDetails: IExtractedInterviewDetails;
    suggestedApplicationStatus?: string;
  }> {
    const systemPrompt = `You are an AI Email Reply Intelligence Agent for job applicants.
Analyze the incoming recruiter email message.
Classify it into one of: 'interview_invitation', 'rejection', 'assessment_request', 'salary_inquiry', 'general_reply', 'auto_responder', 'spam'.
Extract interview dates, links, and next steps if present.
Return JSON:
{
  "classification": string,
  "confidence": number,
  "extractedDetails": {
    "interviewDates": string[],
    "meetingLink": string,
    "interviewType": "phone"|"video"|"onsite"|"technical"|"hr",
    "nextSteps": string,
    "notes": string
  },
  "suggestedApplicationStatus": "interview"|"rejected"|"under_review"|null
}`;

    const userPrompt = `Sender: ${senderEmail}\nSubject: ${subject}\n\n${body}`;

    try {
      const parsed = await this.aiService.generateJSON<any>(systemPrompt, userPrompt);
      if (parsed?.classification) {
        return {
          classification: parsed.classification as EmailReplyClassification,
          confidence: parsed.confidence || 85,
          extractedDetails: parsed.extractedDetails || {},
          suggestedApplicationStatus: parsed.suggestedApplicationStatus,
        };
      }
    } catch (err: any) {
      logger.debug('AI email classification fallback used:', err.message);
    }

    // Heuristic classification
    const text = (subject + ' ' + body).toLowerCase();

    if (
      text.includes('interview') ||
      text.includes('invitation') ||
      text.includes('schedule a call') ||
      text.includes('calendly.com')
    ) {
      const dates = text.match(/\b(monday|tuesday|wednesday|thursday|friday|\d{1,2}\/\d{1,2})\b/gi) || [];
      const linkMatch = body.match(/https?:\/\/[^\s]*(zoom|meet|teams|calendly)[^\s]*/i);

      return {
        classification: 'interview_invitation',
        confidence: 90,
        extractedDetails: {
          interviewDates: dates.slice(0, 3),
          meetingLink: linkMatch ? linkMatch[0] : undefined,
          interviewType: 'video',
          nextSteps: 'Select an available interview slot or reply to confirm availability.',
        },
        suggestedApplicationStatus: 'interview',
      };
    }

    if (
      text.includes('unfortunately') ||
      text.includes('not moving forward') ||
      text.includes('other candidates') ||
      text.includes('pursue other applicants')
    ) {
      return {
        classification: 'rejection',
        confidence: 95,
        extractedDetails: {},
        suggestedApplicationStatus: 'rejected',
      };
    }

    if (text.includes('assessment') || text.includes('hackerrank') || text.includes('codesignal')) {
      return {
        classification: 'assessment_request',
        confidence: 90,
        extractedDetails: {
          nextSteps: 'Complete technical coding assessment.',
        },
        suggestedApplicationStatus: 'under_review',
      };
    }

    return {
      classification: 'general_reply',
      confidence: 70,
      extractedDetails: {},
      suggestedApplicationStatus: 'under_review',
    };
  }

  /**
   * Processes a detected recruiter response and updates application tracking state
   */
  public async handleRecruiterReply(
    userId: string,
    senderEmail: string,
    subject: string,
    body: string
  ): Promise<void> {
    const analysis = await this.classifyEmailReply(senderEmail, subject, body);

    logger.info(`Classified reply from ${senderEmail} as: ${analysis.classification}`);

    // Update corresponding OutreachMessage if exists
    await OutreachMessage.findOneAndUpdate(
      { userId, status: 'sent' },
      { status: 'replied', repliedAt: new Date() }
    );

    // Update corresponding application
    if (analysis.suggestedApplicationStatus) {
      const app = await Application.findOne({ userId }).sort({ updatedAt: -1 });
      if (app) {
        app.status = analysis.suggestedApplicationStatus as any;
        app.timeline.push({
          status: app.status,
          changedAt: new Date(),
          notes: `Updated automatically from recruiter reply: ${analysis.classification}`,
        });
        await app.save();
      }
    }

    // Create Notification
    const notifType =
      analysis.classification === 'interview_invitation'
        ? 'interview_alert'
        : analysis.classification === 'rejection'
        ? 'info'
        : 'success';

    await Notification.create({
      userId,
      title:
        analysis.classification === 'interview_invitation'
          ? '🎉 Interview Invitation Detected!'
          : `Recruiter Update: ${subject.slice(0, 40)}`,
      message:
        analysis.classification === 'interview_invitation'
          ? `A recruiter invited you to an interview! Details: ${analysis.extractedDetails.nextSteps || 'Check email center for dates and links.'}`
          : `Received response categorized as ${analysis.classification}.`,
      type: notifType,
      metadata: {
        sender: senderEmail,
        classification: analysis.classification,
        extracted: analysis.extractedDetails,
      },
    });
  }
}
