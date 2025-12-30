export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'observe' | 'navigate';
  navigateTo?: string;
  highlightPadding?: number;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  steps: TutorialStep[];
  category: 'getting-started' | 'quotes' | 'crm' | 'products';
}

export const TUTORIALS: Tutorial[] = [
  {
    id: 'welcome',
    title: 'Welcome Tour',
    description: 'Get familiar with the main areas of the application',
    icon: 'Compass',
    estimatedMinutes: 2,
    category: 'getting-started',
    steps: [
      {
        id: 'welcome-intro',
        title: 'Welcome to 4SGM Quote Calculator!',
        description: 'This quick tour will show you around the main features. You can skip anytime by pressing Escape or clicking outside.',
        position: 'center',
        action: 'observe',
      },
      {
        id: 'welcome-sidebar',
        title: 'Navigation Sidebar',
        description: 'Use this sidebar to navigate between different sections: Dashboard, QuickQuote, Price Lists, CRM, and more.',
        targetSelector: '[data-testid="sidebar-nav"]',
        position: 'right',
        action: 'observe',
      },
      {
        id: 'welcome-dashboard',
        title: 'Dashboard Overview',
        description: 'The dashboard gives you a quick overview of your sales activity, recent quotes, and important metrics.',
        targetSelector: '[data-testid="dashboard-stats"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'welcome-quickquote',
        title: 'QuickQuote',
        description: 'This is where you create product quotes for customers. Let\'s explore it next!',
        targetSelector: '[data-testid="nav-quickquote"]',
        position: 'right',
        action: 'observe',
      },
      {
        id: 'welcome-complete',
        title: 'You\'re Ready!',
        description: 'You now know the basics. Explore other tutorials to learn about creating quotes, managing customers, and more!',
        position: 'center',
        action: 'observe',
      },
    ],
  },
  {
    id: 'quickquote-basics',
    title: 'Creating Your First Quote',
    description: 'Learn how to create and send a product quote to a customer',
    icon: 'Calculator',
    estimatedMinutes: 4,
    category: 'quotes',
    steps: [
      {
        id: 'qq-intro',
        title: 'Let\'s Create a Quote',
        description: 'QuickQuote helps you build professional quotes in minutes. We\'ll walk through the process step by step.',
        position: 'center',
        action: 'observe',
      },
      {
        id: 'qq-navigate',
        title: 'Go to QuickQuote',
        description: 'First, navigate to the QuickQuote page using the sidebar.',
        targetSelector: '[data-testid="nav-quickquote"]',
        position: 'right',
        action: 'click',
        navigateTo: '/quickquote',
      },
      {
        id: 'qq-customer',
        title: 'Select a Customer',
        description: 'Choose an existing customer or create a new one. The customer determines the pricing tier automatically.',
        targetSelector: '[data-testid="customer-select"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'qq-category',
        title: 'Choose Product Category',
        description: 'Select a category to see available products with their pricing tiers.',
        targetSelector: '[data-testid="category-select"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'qq-products',
        title: 'Add Products',
        description: 'Click on products to add them to your quote. You can adjust quantities and see real-time pricing.',
        targetSelector: '[data-testid="product-list"]',
        position: 'top',
        action: 'observe',
      },
      {
        id: 'qq-cart',
        title: 'Review Your Quote',
        description: 'Check the items in your quote, adjust quantities, and see the total price.',
        targetSelector: '[data-testid="quote-cart"]',
        position: 'left',
        action: 'observe',
      },
      {
        id: 'qq-send',
        title: 'Send the Quote',
        description: 'When ready, you can email the quote directly to the customer or download it as a PDF.',
        targetSelector: '[data-testid="btn-send-quote"]',
        position: 'top',
        action: 'observe',
      },
      {
        id: 'qq-complete',
        title: 'Great Job!',
        description: 'You now know how to create quotes. Each quote is automatically tracked in the CRM for follow-ups!',
        position: 'center',
        action: 'observe',
      },
    ],
  },
  {
    id: 'crm-overview',
    title: 'Customer Activity Hub',
    description: 'Learn to track customer interactions and manage follow-ups',
    icon: 'Users',
    estimatedMinutes: 3,
    category: 'crm',
    steps: [
      {
        id: 'crm-intro',
        title: 'Managing Customer Relationships',
        description: 'The CRM helps you track all customer interactions and never miss a follow-up.',
        position: 'center',
        action: 'observe',
      },
      {
        id: 'crm-navigate',
        title: 'Go to CRM',
        description: 'Navigate to the Customer Activity Hub.',
        targetSelector: '[data-testid="nav-crm"]',
        position: 'right',
        action: 'click',
        navigateTo: '/crm',
      },
      {
        id: 'crm-daily-tab',
        title: 'Start Your Day',
        description: 'This tab shows your daily tasks, overdue follow-ups, and accounts needing attention.',
        targetSelector: '[data-testid="tab-daily"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'crm-tasks',
        title: 'Follow-up Tasks',
        description: 'Check off tasks as you complete them. The system automatically creates follow-ups when you send quotes or samples.',
        targetSelector: '[data-testid="today-tasks-section"]',
        position: 'right',
        action: 'observe',
      },
      {
        id: 'crm-pipeline-tab',
        title: 'Journey Pipeline',
        description: 'Use the Pipeline view to see customers at different stages of the sales journey.',
        targetSelector: '[data-testid="tab-pipeline"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'crm-complete',
        title: 'Stay Organized!',
        description: 'The CRM ensures no customer falls through the cracks. Check it daily for best results!',
        position: 'center',
        action: 'observe',
      },
    ],
  },
  {
    id: 'pricelist-guide',
    title: 'Generating Price Lists',
    description: 'Create professional price lists for customer categories',
    icon: 'FileText',
    estimatedMinutes: 3,
    category: 'quotes',
    steps: [
      {
        id: 'pl-intro',
        title: 'Price Lists Made Easy',
        description: 'Price Lists show all products in a category with tier-based pricing. Perfect for sharing with customers.',
        position: 'center',
        action: 'observe',
      },
      {
        id: 'pl-navigate',
        title: 'Go to Price Lists',
        description: 'Navigate to the Price Lists section.',
        targetSelector: '[data-testid="nav-pricelist"]',
        position: 'right',
        action: 'click',
        navigateTo: '/pricelist',
      },
      {
        id: 'pl-select-category',
        title: 'Choose Category',
        description: 'Select a product category to generate the price list for.',
        targetSelector: '[data-testid="category-filter"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'pl-select-tier',
        title: 'Select Pricing Tier',
        description: 'Choose the appropriate pricing tier for the customer (A, B, C, or D).',
        targetSelector: '[data-testid="tier-filter"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'pl-download',
        title: 'Download or Share',
        description: 'Generate a PDF or send it directly to the customer via email.',
        targetSelector: '[data-testid="btn-generate-pricelist"]',
        position: 'top',
        action: 'observe',
      },
      {
        id: 'pl-complete',
        title: 'Professional Price Lists',
        description: 'Price lists are automatically tracked in customer activity for easy follow-up!',
        position: 'center',
        action: 'observe',
      },
    ],
  },
  {
    id: 'sample-requests',
    title: 'Managing Sample Requests',
    description: 'Track product samples sent to customers',
    icon: 'Package',
    estimatedMinutes: 2,
    category: 'crm',
    steps: [
      {
        id: 'sr-intro',
        title: 'Sample Request Management',
        description: 'Track samples sent to customers and follow up on feedback and test results.',
        position: 'center',
        action: 'observe',
      },
      {
        id: 'sr-navigate',
        title: 'Access Samples',
        description: 'Sample requests are managed from the Samples section.',
        targetSelector: '[data-testid="nav-samples"]',
        position: 'right',
        action: 'click',
        navigateTo: '/samples',
      },
      {
        id: 'sr-create',
        title: 'Create a Request',
        description: 'Click to create a new sample request, specifying the product and shipping details.',
        targetSelector: '[data-testid="btn-new-sample"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'sr-track',
        title: 'Track Status',
        description: 'Update sample status as it moves from pending to shipped to delivered.',
        targetSelector: '[data-testid="sample-status"]',
        position: 'right',
        action: 'observe',
      },
      {
        id: 'sr-complete',
        title: 'Never Miss Follow-ups',
        description: 'When samples are shipped, the system automatically creates follow-up tasks to check on delivery and results.',
        position: 'center',
        action: 'observe',
      },
    ],
  },
  {
    id: 'customer-coach',
    title: 'Customer Coach Panel',
    description: 'Learn how to use the smart coaching system for customer development',
    icon: 'Users',
    estimatedMinutes: 4,
    category: 'crm',
    steps: [
      {
        id: 'cc-intro',
        title: 'Meet the Customer Coach',
        description: 'The Coach Panel gives you smart suggestions for each customer based on their machines, category trust, and order history.',
        position: 'center',
        action: 'observe',
      },
      {
        id: 'cc-navigate',
        title: 'Go to CRM',
        description: 'First, navigate to the CRM to access customer details.',
        targetSelector: '[data-testid="nav-crm"]',
        position: 'right',
        action: 'click',
        navigateTo: '/crm',
      },
      {
        id: 'cc-select-customer',
        title: 'Open a Customer',
        description: 'Click on any customer to see their Coach Panel with personalized recommendations.',
        targetSelector: '[data-testid="tab-clients"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'cc-next-move',
        title: 'Next Best Move',
        description: 'The Coach tells you the single most important action for this customer - like confirming machines, sending samples, or checking reorders.',
        targetSelector: '[data-testid="next-best-move-button"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'cc-machines',
        title: 'Machine Profile',
        description: 'Select the machine types this customer uses. This unlocks compatible product categories automatically.',
        targetSelector: '[data-testid="machine-offset"]',
        position: 'right',
        action: 'observe',
      },
      {
        id: 'cc-categories',
        title: 'Category Trust',
        description: 'See which categories are unlocked for this customer. Click the arrow to advance trust levels as you build the relationship.',
        targetSelector: '[data-testid="customer-coach-panel"]',
        position: 'right',
        action: 'observe',
      },
      {
        id: 'cc-complete',
        title: 'Work Smarter!',
        description: 'The Coach Panel helps you focus on what matters most. Check it daily to stay on top of customer development!',
        position: 'center',
        action: 'observe',
      },
    ],
  },
  {
    id: 'email-studio',
    title: 'Email Studio',
    description: 'Learn how to send professional emails to customers',
    icon: 'FileText',
    estimatedMinutes: 3,
    category: 'crm',
    steps: [
      {
        id: 'es-intro',
        title: 'Email Studio Overview',
        description: 'Email Studio lets you send professional, pre-formatted emails to customers with automatic variable insertion.',
        position: 'center',
        action: 'observe',
      },
      {
        id: 'es-navigate',
        title: 'Access Email Studio',
        description: 'Navigate to the Email app in the sidebar.',
        targetSelector: '[data-testid="nav-email"]',
        position: 'right',
        action: 'click',
        navigateTo: '/email',
      },
      {
        id: 'es-templates',
        title: 'Choose a Template',
        description: 'Pick from pre-made templates like Sample Follow-Up, Quote Follow-Up, or Introduction emails.',
        targetSelector: '[data-testid="template-list"]',
        position: 'right',
        action: 'observe',
      },
      {
        id: 'es-customer',
        title: 'Select Recipient',
        description: 'Choose the customer to send to. Their name and details will be auto-filled into the template.',
        targetSelector: '[data-testid="customer-select"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'es-send',
        title: 'Review and Send',
        description: 'Preview your email, make any edits, then send. All emails are logged to customer activity automatically!',
        targetSelector: '[data-testid="btn-send-email"]',
        position: 'top',
        action: 'observe',
      },
      {
        id: 'es-complete',
        title: 'Professional Communication',
        description: 'Email Studio ensures consistent, professional communication with customers while saving you time!',
        position: 'center',
        action: 'observe',
      },
    ],
  },
];

export const TUTORIAL_CATEGORIES = {
  'getting-started': {
    title: 'Getting Started',
    description: 'New to the app? Start here!',
    icon: 'Rocket',
  },
  'quotes': {
    title: 'Quotes & Pricing',
    description: 'Learn to create quotes and price lists',
    icon: 'Calculator',
  },
  'crm': {
    title: 'Customer Management',
    description: 'Track customers and follow-ups',
    icon: 'Users',
  },
  'products': {
    title: 'Products',
    description: 'Manage your product catalog',
    icon: 'Package',
  },
};

export function getTutorialById(id: string): Tutorial | undefined {
  return TUTORIALS.find(t => t.id === id);
}

export function getTutorialsByCategory(category: string): Tutorial[] {
  return TUTORIALS.filter(t => t.category === category);
}
