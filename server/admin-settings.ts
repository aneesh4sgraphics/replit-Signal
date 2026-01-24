import { db } from "./db";
import { adminSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

export const ADMIN_SETTING_KEYS = {
  AI_EMAIL_ANALYSIS_ENABLED: 'ai_email_analysis_enabled',
  GMAIL_SYNC_INTERVAL_MINUTES: 'gmail_sync_interval_minutes',
  RAG_CHATBOT_ENABLED: 'rag_chatbot_enabled',
} as const;

export type AdminSettingKey = typeof ADMIN_SETTING_KEYS[keyof typeof ADMIN_SETTING_KEYS];

const DEFAULT_VALUES: Record<AdminSettingKey, string> = {
  [ADMIN_SETTING_KEYS.AI_EMAIL_ANALYSIS_ENABLED]: 'true',
  [ADMIN_SETTING_KEYS.GMAIL_SYNC_INTERVAL_MINUTES]: '30',
  [ADMIN_SETTING_KEYS.RAG_CHATBOT_ENABLED]: 'true',
};

export async function getAdminSetting(key: AdminSettingKey): Promise<string> {
  try {
    const result = await db.select()
      .from(adminSettings)
      .where(eq(adminSettings.key, key))
      .limit(1);
    
    if (result.length > 0) {
      return result[0].value;
    }
    return DEFAULT_VALUES[key] || '';
  } catch (error) {
    console.error(`[Admin Settings] Error fetching ${key}:`, error);
    return DEFAULT_VALUES[key] || '';
  }
}

export async function getAdminSettingBool(key: AdminSettingKey): Promise<boolean> {
  const value = await getAdminSetting(key);
  return value === 'true' || value === '1';
}

export async function setAdminSetting(
  key: AdminSettingKey, 
  value: string, 
  userId?: string,
  description?: string
): Promise<void> {
  try {
    const existing = await db.select()
      .from(adminSettings)
      .where(eq(adminSettings.key, key))
      .limit(1);
    
    if (existing.length > 0) {
      await db.update(adminSettings)
        .set({ 
          value, 
          updatedAt: new Date(),
          updatedByUserId: userId || null,
        })
        .where(eq(adminSettings.key, key));
    } else {
      await db.insert(adminSettings).values({
        key,
        value,
        description,
        updatedByUserId: userId || null,
      });
    }
    console.log(`[Admin Settings] Set ${key} = ${value}`);
  } catch (error) {
    console.error(`[Admin Settings] Error setting ${key}:`, error);
    throw error;
  }
}

export async function getAllAdminSettings(): Promise<Record<string, { value: string; description: string | null; updatedAt: Date | null }>> {
  const settings: Record<string, { value: string; description: string | null; updatedAt: Date | null }> = {};
  
  for (const key of Object.values(ADMIN_SETTING_KEYS)) {
    settings[key] = { 
      value: DEFAULT_VALUES[key as AdminSettingKey], 
      description: null,
      updatedAt: null,
    };
  }
  
  try {
    const dbSettings = await db.select().from(adminSettings);
    for (const setting of dbSettings) {
      settings[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt,
      };
    }
  } catch (error) {
    console.error('[Admin Settings] Error fetching all settings:', error);
  }
  
  return settings;
}

export async function isAIEmailAnalysisEnabled(): Promise<boolean> {
  return getAdminSettingBool(ADMIN_SETTING_KEYS.AI_EMAIL_ANALYSIS_ENABLED);
}
