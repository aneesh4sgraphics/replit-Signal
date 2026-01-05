export const DEMO_USER = {
  id: "demo-user",
  email: "demo@4sgraphics.com",
  role: "admin" as const,
  status: "approved" as const,
  firstName: "Demo",
  lastName: "User"
};

export const DEMO_CUSTOMERS = [
  { id: "demo-1", firstName: "John", lastName: "Smith", email: "john@abcprinting.com", company: "ABC Printing Co.", city: "Miami", province: "FL", country: "United States", phone: "(305) 555-0101", pricingTier: "Tier 1", salesRepId: "45165274", acceptsEmailMarketing: true, tags: "printing,offset", createdAt: new Date().toISOString() },
  { id: "demo-2", firstName: "Sarah", lastName: "Johnson", email: "sarah@digitalpress.com", company: "Digital Press Masters", city: "Los Angeles", province: "CA", country: "United States", phone: "(310) 555-0202", pricingTier: "Tier 2", salesRepId: "45980257", acceptsEmailMarketing: true, tags: "digital,labels", createdAt: new Date().toISOString() },
  { id: "demo-3", firstName: "Mike", lastName: "Williams", email: "mike@quickprint.com", company: "Quick Print Solutions", city: "Houston", province: "TX", country: "United States", phone: "(713) 555-0303", pricingTier: "Tier 3", salesRepId: "45980257", acceptsEmailMarketing: false, tags: "flexo", createdAt: new Date().toISOString() },
  { id: "demo-4", firstName: "Lisa", lastName: "Brown", email: "lisa@premiumgraphics.com", company: "Premium Graphics LLC", city: "Chicago", province: "IL", country: "United States", phone: "(312) 555-0404", pricingTier: "Tier 1", salesRepId: "45980257", acceptsEmailMarketing: true, tags: "premium,packaging", createdAt: new Date().toISOString() },
  { id: "demo-5", firstName: "David", lastName: "Garcia", email: "david@inkmasters.com", company: "Ink Masters International", city: "New York", province: "NY", country: "United States", phone: "(212) 555-0505", pricingTier: "Tier 2", salesRepId: "45980257", acceptsEmailMarketing: true, tags: "inks,coatings", createdAt: new Date().toISOString() },
  { id: "demo-6", firstName: "Jennifer", lastName: "Martinez", email: "jennifer@southernprint.com", company: "Southern Print Works", city: "Atlanta", province: "GA", country: "United States", phone: "(404) 555-0606", pricingTier: "Tier 4", salesRepId: "45165274", acceptsEmailMarketing: false, tags: "offset", createdAt: new Date().toISOString() },
  { id: "demo-7", firstName: "Robert", lastName: "Lee", email: "robert@pacificlabel.com", company: "Pacific Label Co.", city: "San Francisco", province: "CA", country: "United States", phone: "(415) 555-0707", pricingTier: "Tier 2", salesRepId: "45980257", acceptsEmailMarketing: true, tags: "labels,flexo", createdAt: new Date().toISOString() },
  { id: "demo-8", firstName: "Amanda", lastName: "Taylor", email: "amanda@midwestpack.com", company: "Midwest Packaging", city: "Detroit", province: "MI", country: "United States", phone: "(313) 555-0808", pricingTier: "Tier 3", salesRepId: "45980257", acceptsEmailMarketing: true, tags: "packaging", createdAt: new Date().toISOString() },
  { id: "demo-9", firstName: "Carlos", lastName: "Rodriguez", email: "carlos@latinoprint.com", company: "Latino Print Services", city: "Mexico City", province: "CDMX", country: "Mexico", phone: "+52 55 1234 5678", pricingTier: "Tier 2", salesRepId: "45163473", acceptsEmailMarketing: true, tags: "offset,digital", createdAt: new Date().toISOString() },
  { id: "demo-10", firstName: "Maria", lastName: "Gonzalez", email: "maria@sudprint.com", company: "Sud Print Argentina", city: "Buenos Aires", province: "BA", country: "Argentina", phone: "+54 11 5555 6789", pricingTier: "Tier 3", salesRepId: "45163473", acceptsEmailMarketing: true, tags: "labels", createdAt: new Date().toISOString() },
  { id: "demo-11", firstName: "James", lastName: "Wilson", email: "james@eastcoastlabels.com", company: "East Coast Labels", city: "Boston", province: "MA", country: "United States", phone: "(617) 555-1111", pricingTier: "Tier 1", salesRepId: "45980257", acceptsEmailMarketing: true, tags: "labels,premium", createdAt: new Date().toISOString() },
  { id: "demo-12", firstName: "Emily", lastName: "Davis", email: "emily@sunbeltprint.com", company: "Sunbelt Printing", city: "Phoenix", province: "AZ", country: "United States", phone: "(602) 555-1212", pricingTier: "Tier 2", salesRepId: "45980257", acceptsEmailMarketing: false, tags: "wide-format", createdAt: new Date().toISOString() },
];

export const DEMO_PRODUCTS = [
  { id: 1, categoryName: "Coated Papers", typeName: "Premium", sizeName: "23x35", priceDealer: 45.99, priceDistributor: 42.50, priceOEM: 38.00, priceMSRP: 55.00, sku: "CP-PREM-2335", stock: 1250 },
  { id: 2, categoryName: "Coated Papers", typeName: "Matte Finish", sizeName: "25x38", priceDealer: 52.50, priceDistributor: 48.00, priceOEM: 44.00, priceMSRP: 62.00, sku: "CP-MATT-2538", stock: 890 },
  { id: 3, categoryName: "Cover Stock", typeName: "Gloss 12pt", sizeName: "20x26", priceDealer: 68.00, priceDistributor: 62.00, priceOEM: 56.00, priceMSRP: 82.00, sku: "CS-GL12-2026", stock: 2100 },
  { id: 4, categoryName: "Uncoated Papers", typeName: "Text 70#", sizeName: "23x35", priceDealer: 38.25, priceDistributor: 35.00, priceOEM: 31.50, priceMSRP: 46.00, sku: "UP-TX70-2335", stock: 3400 },
  { id: 5, categoryName: "Bond Papers", typeName: "Recycled 24#", sizeName: "17x22", priceDealer: 29.99, priceDistributor: 27.50, priceOEM: 24.00, priceMSRP: 36.00, sku: "BP-RC24-1722", stock: 1800 },
  { id: 6, categoryName: "Label Materials", typeName: "Synthetic", sizeName: "12x18", priceDealer: 89.00, priceDistributor: 82.00, priceOEM: 75.00, priceMSRP: 105.00, sku: "LM-SYNT-1218", stock: 560 },
  { id: 7, categoryName: "Specialty Papers", typeName: "Metallic Gold", sizeName: "19x25", priceDealer: 125.00, priceDistributor: 115.00, priceOEM: 105.00, priceMSRP: 150.00, sku: "SP-GOLD-1925", stock: 320 },
  { id: 8, categoryName: "Digital Papers", typeName: "HP Indigo", sizeName: "13x19", priceDealer: 78.50, priceDistributor: 72.00, priceOEM: 65.00, priceMSRP: 95.00, sku: "DP-HPIN-1319", stock: 1450 },
];

export const DEMO_QUOTES = [
  { id: 197, quoteNumber: "S031856", customerId: "demo-1", customerName: "ABC Printing Co.", customerEmail: "john@abcprinting.com", totalAmount: "12500.00", status: "sent", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), items: [] },
  { id: 196, quoteNumber: "S031855", customerId: "demo-2", customerName: "Digital Press Masters", customerEmail: "sarah@digitalpress.com", totalAmount: "8750.00", status: "pending", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), items: [] },
  { id: 195, quoteNumber: "S031854", customerId: "demo-3", customerName: "Quick Print Solutions", customerEmail: "mike@quickprint.com", totalAmount: "3200.00", status: "draft", createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), items: [] },
  { id: 194, quoteNumber: "S031853", customerId: "demo-4", customerName: "Premium Graphics LLC", customerEmail: "lisa@premiumgraphics.com", totalAmount: "15800.00", status: "won", createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), items: [] },
  { id: 193, quoteNumber: "S031852", customerId: "demo-5", customerName: "Ink Masters International", customerEmail: "david@inkmasters.com", totalAmount: "6400.00", status: "lost", createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), items: [] },
];

export const DEMO_USERS = [
  { id: "45165274", email: "santiago@4sgraphics.com", firstName: "Santiago", lastName: "Ruiz", role: "user", status: "approved" },
  { id: "45163473", email: "patricio@4sgraphics.com", firstName: "Patricio", lastName: "Mendez", role: "user", status: "approved" },
  { id: "45980257", email: "aneesh@4sgraphics.com", firstName: "Aneesh", lastName: "Kumar", role: "admin", status: "approved" },
];

export const DEMO_DASHBOARD_STATS = {
  totalQuotes: "128",
  quotesThisMonth: "18",
  monthlyRevenue: 48500.00,
  totalCustomers: "3257",
  totalProducts: "211",
  activityCount: 45
};

export const DEMO_CRM_DASHBOARD = {
  stageCounts: [
    { stage: "trigger", count: 15 },
    { stage: "awareness", count: 28 },
    { stage: "consideration", count: 42 },
    { stage: "decision", count: 18 },
    { stage: "retention", count: 125 }
  ],
  recentActivities: [],
  topCustomers: []
};

export const DEMO_CRITICAL_CLIENTS = [
  { customerId: "demo-2", companyName: "Digital Press Masters", reason: "Quote follow-up overdue", priority: "high", daysOverdue: 3 },
  { customerId: "demo-3", companyName: "Quick Print Solutions", reason: "Sample request pending", priority: "medium", daysOverdue: 1 },
  { customerId: "demo-6", companyName: "Southern Print Works", reason: "New prospect - needs intro call", priority: "high", daysOverdue: 0 },
  { customerId: "demo-8", companyName: "Midwest Packaging", reason: "Pricing tier review needed", priority: "medium", daysOverdue: 2 },
  { customerId: "demo-12", companyName: "Sunbelt Printing", reason: "Reorder opportunity", priority: "low", daysOverdue: 0 },
];

export const DEMO_FOLLOW_UPS = [
  { id: 1, customerId: "demo-2", type: "quote_follow_up", dueDate: new Date().toISOString(), status: "pending", notes: "Follow up on quote S031855" },
  { id: 2, customerId: "demo-3", type: "sample_request", dueDate: new Date(Date.now() + 86400000).toISOString(), status: "pending", notes: "Send sample kit" },
  { id: 3, customerId: "demo-6", type: "intro_call", dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: "pending", notes: "Schedule product demo" },
];

export const DEMO_ACTIVITY_STATS = {
  todayTasks: 5,
  overdueTasks: 2,
  completedThisWeek: 12,
  upcomingTasks: 8
};

export const DEMO_TUTORIALS_PROGRESS = [
  { id: 1, tutorialId: "quick-quotes", userEmail: "demo@4sgraphics.com", completed: true },
  { id: 2, tutorialId: "client-database", userEmail: "demo@4sgraphics.com", completed: true },
  { id: 3, tutorialId: "email-studio", userEmail: "demo@4sgraphics.com", completed: false },
];

export const DEMO_QUOTE_COUNTS: Record<string, number> = {
  "john@abcprinting.com": 5,
  "sarah@digitalpress.com": 3,
  "mike@quickprint.com": 1,
  "lisa@premiumgraphics.com": 8,
  "david@inkmasters.com": 2,
};

export const DEMO_PRICE_LIST_COUNTS: Record<string, number> = {
  "demo-1": 2,
  "demo-4": 1,
};

export const DEMO_OBJECTIONS: any[] = [];
export const DEMO_SWATCH_SHIPMENTS: any[] = [];
export const DEMO_SAMPLE_REQUESTS: any[] = [];
export const DEMO_PRESS_KIT_SHIPMENTS: any[] = [];
export const DEMO_EMAIL_SENDS: any[] = [];
export const DEMO_PENDING_FOLLOW_UPS: any[] = [];
export const DEMO_LOST_NOTIFICATIONS: any[] = [];
export const DEMO_ACTIVITY_EVENTS: any[] = [];

export const DEMO_USAGE = {
  database: { size: "1028 MB", sizeBytes: 1077936128, maxSize: "10 GB", usagePercent: 10.28 },
  api: { requestsToday: 1250, requestsThisMonth: 28500 }
};

export const DEMO_API_RESPONSES: Record<string, any> = {
  "/api/auth/user": DEMO_USER,
  "/api/customers": DEMO_CUSTOMERS,
  "/api/products": DEMO_PRODUCTS,
  "/api/sent-quotes": DEMO_QUOTES,
  "/api/users": DEMO_USERS,
  "/api/dashboard/stats": DEMO_DASHBOARD_STATS,
  "/api/dashboard/crm": DEMO_CRM_DASHBOARD,
  "/api/dashboard/critical-clients": DEMO_CRITICAL_CLIENTS,
  "/api/dashboard/usage": DEMO_USAGE,
  "/api/customer-activity/follow-ups": DEMO_FOLLOW_UPS,
  "/api/customer-activity/follow-ups/today": [],
  "/api/customer-activity/follow-ups/overdue": DEMO_FOLLOW_UPS.slice(0, 2),
  "/api/customer-activity/events": DEMO_ACTIVITY_EVENTS,
  "/api/customer-activity/dashboard-stats": DEMO_ACTIVITY_STATS,
  "/api/tutorials/progress": DEMO_TUTORIALS_PROGRESS,
  "/api/customers/quote-counts": DEMO_QUOTE_COUNTS,
  "/api/customers/price-list-counts": DEMO_PRICE_LIST_COUNTS,
  "/api/crm/objections": DEMO_OBJECTIONS,
  "/api/crm/swatch-shipments": DEMO_SWATCH_SHIPMENTS,
  "/api/crm/sample-requests": DEMO_SAMPLE_REQUESTS,
  "/api/crm/press-kit-shipments": DEMO_PRESS_KIT_SHIPMENTS,
  "/api/email/sends": DEMO_EMAIL_SENDS,
  "/api/quotes/follow-ups/pending": DEMO_PENDING_FOLLOW_UPS,
  "/api/quotes/lost-notifications": DEMO_LOST_NOTIFICATIONS,
};
