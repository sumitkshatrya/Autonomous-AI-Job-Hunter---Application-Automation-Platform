import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AutomationSettings } from '../models/AutomationSettings';
import { AutomationSettingsSchema } from '@autoapply/shared';

export class SettingsController {
  public static async getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    let settings = await AutomationSettings.findOne({ userId: req.userId });
    if (!settings) {
      settings = await AutomationSettings.create({
        userId: req.userId,
        organizationId: req.organizationId,
        enabled: true,
        autoApplyThreshold: 75,
        dailyApplicationLimit: 50,
        dailyEmailOutreachLimit: 25,
        dailyWhatsAppLimit: 10,
      });
    }

    res.json({ success: true, settings });
  }

  public static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    const validated = AutomationSettingsSchema.parse(req.body);

    const settings = await AutomationSettings.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        organizationId: req.organizationId,
        ...validated,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Automation settings updated successfully',
      settings,
    });
  }
}
