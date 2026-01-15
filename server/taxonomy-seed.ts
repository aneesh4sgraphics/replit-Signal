import { db } from "./db";
import { adminMachineTypes, adminCategoryGroups, adminCategories, adminCoachingTimers, adminNudgeSettings } from "@shared/schema";

export async function ensureTaxonomySeeded(): Promise<void> {
  try {
    const existingMachines = await db.select().from(adminMachineTypes).limit(1);
    
    if (existingMachines.length > 0) {
      console.log('[Taxonomy] Admin taxonomy already seeded');
      return;
    }
    
    console.log('[Taxonomy] Seeding admin taxonomy for first time...');
    
    const machineTypes = [
      { code: 'offset', label: 'Offset', icon: 'Printer', description: 'Traditional offset lithography presses', sortOrder: 1 },
      { code: 'digital_dry_toner', label: 'Digital Dry Toner', icon: 'Zap', description: 'Xerox, Canon, Konica Minolta dry toner', sortOrder: 2 },
      { code: 'hp_indigo', label: 'HP Indigo', icon: 'Sparkles', description: 'HP Indigo liquid electroink presses', sortOrder: 3 },
      { code: 'inkjet_uv_sheetfed', label: 'UV Inkjet (SheetFed)', icon: 'Droplet', description: 'UV-curable inkjet printers', sortOrder: 4 },
      { code: 'flexo', label: 'Flexo', icon: 'Layers', description: 'Flexographic printing', sortOrder: 5 },
      { code: 'wide_format_eco-sol/uv/latex', label: 'Wide Format - EcoSol / UV / Latex', icon: 'Maximize', description: 'Wide format printers', sortOrder: 6 },
      { code: 'aqueous_inkjet', label: 'Aqueous Inkjet Printer', icon: 'Droplet', description: 'Aqueous-based inkjet', sortOrder: 7 },
      { code: 'screen_printing', label: 'Screen Printing', icon: 'Maximize', description: 'Screen printing equipment', sortOrder: 8 },
      { code: 'inkjet', label: 'Inkjet', icon: 'Droplet', description: 'General inkjet printers', sortOrder: 9 },
      { code: 'wide_format', label: 'Wide Format', icon: 'Maximize', description: 'Wide format general', sortOrder: 10 },
    ];
    
    for (const mt of machineTypes) {
      await db.insert(adminMachineTypes).values(mt).onConflictDoNothing();
    }
    console.log(`[Taxonomy] Seeded ${machineTypes.length} machine types`);
    
    const categoryGroups = [
      { code: 'labels', label: 'Labels', color: 'blue', sortOrder: 1 },
      { code: 'synthetic', label: 'Synthetic', color: 'green', sortOrder: 2 },
      { code: 'specialty', label: 'Specialty', color: 'purple', sortOrder: 3 },
      { code: 'thermal', label: 'Thermal', color: 'orange', sortOrder: 4 },
    ];
    
    for (const cg of categoryGroups) {
      await db.insert(adminCategoryGroups).values(cg).onConflictDoNothing();
    }
    console.log(`[Taxonomy] Seeded ${categoryGroups.length} category groups`);
    
    const categories = [
      { code: 'graffiti_polyester_paper', label: 'Graffiti Polyester Paper', compatibleMachineTypes: ['digital_dry_toner', 'hp_indigo', 'inkjet'], sortOrder: 0 },
      { code: 'graffiti_blended_poly', label: 'Graffiti Blended Poly', compatibleMachineTypes: ['digital_dry_toner', 'hp_indigo', 'inkjet', 'flexo'], sortOrder: 1 },
      { code: 'GRAFFITI_SOFT_POLY', label: 'Graffiti SOFT Poly', compatibleMachineTypes: ['digital_dry_toner', 'hp_indigo', 'inkjet', 'flexo'], sortOrder: 2 },
      { code: 'GRAFFITI_STICK', label: 'Graffiti STICK', compatibleMachineTypes: ['digital_dry_toner', 'hp_indigo', 'inkjet', 'flexo'], sortOrder: 3 },
      { code: 'SOLVIT_SIGN_DISPLAY_MEDIA', label: 'Solvit Sign & Display Media', compatibleMachineTypes: ['wide_format', 'inkjet'], sortOrder: 4 },
      { code: 'CLIQ_AQUEOUS_MEDIAS', label: 'CliQ Aqueous Medias', compatibleMachineTypes: ['aqueous_inkjet'], sortOrder: 5 },
      { code: 'RANG_PRINT_CANVAS', label: 'Rang Print Canvas', compatibleMachineTypes: ['wide_format', 'inkjet'], sortOrder: 6 },
      { code: 'SCREEN_PRINTING_POSITIVES', label: 'Screen Printing Positives', compatibleMachineTypes: ['screen_printing'], sortOrder: 7 },
      { code: 'OFFSET_PRINTING_PLATES', label: 'Offset Printing Plates', compatibleMachineTypes: ['offset'], sortOrder: 8 },
      { code: 'DTF_FILM', label: 'DTF Film', compatibleMachineTypes: ['inkjet'], sortOrder: 9 },
    ];
    
    for (const cat of categories) {
      await db.insert(adminCategories).values(cat).onConflictDoNothing();
    }
    console.log(`[Taxonomy] Seeded ${categories.length} categories`);
    
    const coachingTimers = [
      { timerKey: 'quote_followup_soft', label: 'Quote Follow-up (Soft)', category: 'quote_followup', valueDays: 4, description: 'Days until initial quote follow-up reminder' },
      { timerKey: 'quote_followup_risk', label: 'Quote Follow-up (At Risk)', category: 'quote_followup', valueDays: 7, description: 'Days until quote marked as at-risk' },
      { timerKey: 'quote_followup_expire', label: 'Quote Follow-up (Expired)', category: 'quote_followup', valueDays: 14, description: 'Days until quote considered expired' },
      { timerKey: 'stale_account_days', label: 'Stale Account', category: 'stale_account', valueDays: 60, description: 'Days without touch before account marked stale' },
    ];
    
    for (const ct of coachingTimers) {
      await db.insert(adminCoachingTimers).values(ct).onConflictDoNothing();
    }
    console.log(`[Taxonomy] Seeded ${coachingTimers.length} coaching timers`);
    
    const nudgeSettings = [
      { nudgeKey: 'press_test_followup', label: 'Press Test Follow-up', priority: 10, severity: 'high', isEnabled: true, description: 'Follow up on press tests awaiting results' },
      { nudgeKey: 'quote_followup', label: 'Quote Follow-up', priority: 20, severity: 'medium', isEnabled: true, description: 'Follow up on open quotes' },
      { nudgeKey: 'reorder_overdue', label: 'Reorder Overdue', priority: 30, severity: 'high', isEnabled: true, description: 'Habitual customer missed expected reorder' },
      { nudgeKey: 'stale_account', label: 'Stale Account', priority: 60, severity: 'low', isEnabled: true, description: 'Account has gone quiet' },
    ];
    
    for (const ns of nudgeSettings) {
      await db.insert(adminNudgeSettings).values(ns).onConflictDoNothing();
    }
    console.log(`[Taxonomy] Seeded ${nudgeSettings.length} nudge settings`);
    
    console.log('[Taxonomy] Admin taxonomy seeding complete');
  } catch (error) {
    console.error('[Taxonomy] Error seeding taxonomy:', error);
  }
}
