# Complete Job Requirement: 4S Graphics Pricing Intelligence Platform

## Project Overview

Build a professional-grade pricing intelligence platform for 4S Graphics that streamlines competitor pricing analysis through advanced data management and intelligent quote generation. The application provides a comprehensive interface for competitor pricing tracking, quote generation, PDF export, customer management, and administrative tools.

## Technical Stack Requirements

### Frontend
- **Framework**: React.js with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui component library built on Radix UI
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for development and production builds
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React icons
- **Animations**: Framer Motion for micro-interactions

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Style**: RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL session store (connect-pg-simple)
- **File Handling**: Multer for CSV uploads
- **Authentication**: Replit Auth with domain restriction
- **Development**: tsx for TypeScript execution

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migration**: Drizzle Kit for schema migrations
- **Connection**: Neon Database serverless connection
- **Schema Location**: `/shared/schema.ts` for shared types

## Core Applications

### 1. QuickQuotes (Quote Calculator)
**Purpose**: Generate professional quotes for custom product orders

**Features**:
- Product category, type, and size selection
- Custom dimension calculator with unit conversion (inches/feet to square meters)
- Tiered pricing based on square meter ranges
- Role-based pricing tier filtering (Admin, Santiago, Patricio tiers)
- Retail pricing with 99-cent rounding (.89 → .99, .40 → .99)
- Brand-specific font rendering (Graffiti → Lobster, Solvit → Inter 700, etc.)
- PDF generation with professional formatting
- Email composition with pre-filled product details
- Automatic quote saving to database with unique quote numbers

**Technical Requirements**:
- React Hook Form with Zod validation
- Dynamic product loading from CSV data
- Price calculation API endpoints
- PDF generation using HTML to canvas conversion
- Email integration with mailto functionality

### 2. SqM Calculator (Area Pricer)
**Purpose**: Calculate square meter pricing for custom dimensions with competitor intelligence

**Features**:
- Width/height input with unit selection (inches/feet)
- Product type and pricing tier selection
- Thickness dropdown (1mil-20mil)
- Product kind selection (Vinyl, Paper, Fabric, etc.)
- Surface finish options (Matte, Gloss, Satin, etc.)
- Real-time square meter and pricing calculations
- "ADD TO COMP INFO" functionality to save calculations to shared database
- Integration with competitor pricing intelligence

**Technical Requirements**:
- Custom dimension conversion algorithms
- Direct API integration without React Query complexity
- Inline button implementation with immediate feedback
- Data validation and error handling

### 3. ComIntel (Competitor Pricing Intelligence)
**Purpose**: Centralized competitor pricing analysis and data management

**Features**:
- Shared pricing database accessible to all users
- Advanced filtering by price ranges, dimensions, and product types
- CSV export functionality with clean data formatting
- File upload system for bulk competitor data import
- "Find Duplicates" feature with color-coded highlighting
- Responsive table design with horizontal scrolling
- Delete functionality with confirmation dialogs

**Technical Requirements**:
- Robust authentication flow with loading states
- Comprehensive error handling to prevent blank pages
- CSV parsing with proper quote handling
- Data type conversion (string to number parsing)
- Duplicate detection algorithms

### 4. Price List Generator
**Purpose**: Generate formatted price lists for customer distribution

**Features**:
- Customer selection and creation interface
- Product filtering by category and type
- Three-column pricing structure:
  - Price/Sq.M (original CSV data)
  - Price/Sheet (price × square meters)
  - Price Per Pack (price per sheet × minimum order quantity)
- PDF generation with pagination and professional formatting
- CSV export capability
- Automatic saving to Saved Quotes system

### 5. Shipping Calculator
**Purpose**: Calculate shipping costs with multiple service levels

**Features**:
- Package dimension and weight input
- Automatic dimensional weight calculation
- Zone-based pricing structure
- Multiple service levels (Ground, Priority, Express, Overnight)
- Surcharge calculations for high-value packages
- Individual "Email This" functionality for each shipping option
- Calculation history with CSV export
- Session-based data (no persistence between visits)

## Administrative Features

### Customer Management
- Excel-like interface for customer data
- Company name, address, contact information storage
- CRUD operations with inline editing
- CSV upload/download functionality
- Integration with quote generation

### Product Management
- Comprehensive product catalog management
- Category, type, size, and dimension editing
- Pricing tier management
- Item code and quantity tracking
- Admin-only editing capabilities

### User Management & Authentication
- Replit Auth integration with @4sgraphics.com domain restriction
- Role-based access control (Admin, User)
- Pre-approval workflow for new users
- aneesh@4sgraphics.com and oscar@4sgraphics.com as default admins
- Adaptive login animation system based on user experience level

### Data Management
- CSV upload system with intelligent duplicate handling
- Automatic data migration and merging
- Download all data functionality (ZIP archive)
- File operation logging and audit trails
- Backup system with cleanup utilities

## User Experience Features

### Dashboard Design
- Contemporary app icons with colorful gradients
- Modern rounded-xl styling with hover animations
- Responsive grid layout (2x3 mobile, 6 columns desktop)
- Personalized welcome messages with time-based greetings
- Daily motivational quotes with 6-hour rotation
- Admin tools section separate from user applications

### Micro-Interactions
- Ripple effects on button clicks
- Particle animations for success states
- Loading indicators and form feedback
- Hover scale effects on cards
- Smooth transitions (300ms duration)

### Saved Quotes System
- Automatic quote saving from all applications
- Delivery method tracking (Email, PDF, Not Known)
- Quote history with search and filter
- Customer information display
- Admin delete functionality

## File Management & Safety

### Comprehensive Logging System
- All file operations logged to `file-operations.log`
- Operation types: READ, WRITE, DELETE, UPLOAD, DOWNLOAD
- Timestamp, success/failure status, file size tracking
- User attribution for uploads/downloads

### Intelligent Cleanup System
- `cleanup-files.js` utility with dry-run preview
- Automatic duplicate detection and removal
- Latest version preservation based on modification time
- Backup creation before destructive operations
- File usage reporting and statistics

### Safe File Operations
- Existence checks before all file operations
- Comprehensive error handling with detailed messages
- Automatic directory creation when needed
- Temporary file cleanup after uploads

## Data Schema Requirements

### Core Tables
```typescript
// Users table
users: {
  id: serial primary key
  email: text not null unique
  firstName: text
  lastName: text
  role: text not null default 'user'
  loginCount: integer default 0
  lastLoginDate: timestamp
  approved: boolean default false
  createdAt: timestamp default now()
}

// Sent Quotes table
sentQuotes: {
  id: serial primary key
  quoteNumber: text not null unique
  customerName: text not null
  customerEmail: text nullable
  quoteItems: text not null // JSON string
  totalAmount: text not null
  sentVia: text not null default 'Not Known'
  status: text not null default 'sent'
  createdAt: timestamp default now()
}

// Competitor Pricing table
competitorPricing: {
  id: serial primary key
  productName: text not null
  width: numeric not null
  length: numeric not null
  unit: text not null
  squareMeters: numeric not null
  inputPrice: numeric not null
  pricePerSqIn: numeric not null
  pricePerSqFt: numeric not null
  pricePerSqMeter: numeric not null
  notes: text nullable
  createdAt: timestamp default now()
}
```

### CSV Data Structure
- **Product Data**: Category, Type, Size, Dimensions, Item Codes, Pricing Tiers
- **Customer Data**: Company, Address, Contact Information
- **Pricing Data**: Tiered pricing by square meter ranges

## API Endpoints Specification

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - User logout

### Product Data
- `GET /api/product-categories` - Fetch all categories
- `GET /api/product-types/:categoryId` - Fetch types for category
- `GET /api/product-sizes/:typeId` - Fetch sizes for type
- `GET /api/pricing-tiers` - Fetch all pricing tiers
- `POST /api/calculate-price` - Calculate price for custom dimensions
- `GET /api/price/:squareMeters/:typeId/:tierId` - Get specific pricing

### Customer Management
- `GET /api/customers` - Fetch all customers
- `GET /api/customers/:id` - Fetch specific customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Quote Management
- `GET /api/sent-quotes` - Fetch all saved quotes
- `GET /api/sent-quotes/:id` - Fetch specific quote
- `POST /api/sent-quotes` - Save new quote
- `DELETE /api/sent-quotes/:id` - Delete quote (admin only)

### Competitor Pricing
- `GET /api/competitor-pricing` - Fetch all competitor data
- `POST /api/competitor-pricing` - Add new pricing data
- `DELETE /api/competitor-pricing/:id` - Delete pricing entry
- `POST /api/competitor-pricing/export` - Export to CSV

### File Operations
- `POST /api/admin/upload-product-data` - Upload product CSV
- `POST /api/admin/upload-customer-data` - Upload customer CSV
- `POST /api/admin/upload-pricing-data` - Upload pricing CSV
- `GET /api/download-data` - Download all data (admin only)

### PDF Generation
- `POST /api/generate-quote-pdf` - Generate quote PDF
- `POST /api/generate-price-list-pdf` - Generate price list PDF

## Configuration Requirements

### Environment Variables
```bash
DATABASE_URL=postgresql://connection_string
NODE_ENV=development|production
REPLIT_DB_URL=auto_configured
```

### Build Configuration
- Vite configuration for frontend build
- esbuild for backend compilation
- TypeScript strict configuration
- Path mapping for imports (@shared, @components, etc.)

### Deployment Settings
- Frontend served from `/dist/public`
- Backend API routes with Express
- Static file serving
- Session storage in PostgreSQL

## Security Requirements

### Authentication & Authorization
- Domain-restricted authentication (@4sgraphics.com only)
- Role-based access control throughout application
- Admin-only routes and functionality
- Session management with PostgreSQL store

### File Upload Security
- File type validation (CSV only)
- File size limits (10MB)
- Temporary file cleanup
- Path traversal protection

### Data Validation
- Zod schema validation on all inputs
- SQL injection prevention through ORM
- XSS protection through proper escaping
- CSRF protection through session management

## Performance Requirements

### Caching Strategy
- In-memory cache for frequently accessed data (5-minute duration)
- Cache invalidation on data updates
- Optimized database queries through Drizzle ORM

### File Handling
- Efficient CSV parsing for large datasets
- Streaming file uploads
- Automatic cleanup of temporary files
- Duplicate detection without full file loading

### Frontend Optimization
- Code splitting with Vite
- Optimized bundle size
- Lazy loading for large components
- Efficient re-rendering with React Query

## Testing & Quality Assurance

### Error Handling
- Comprehensive try-catch blocks
- User-friendly error messages
- Detailed logging for debugging
- Graceful degradation for failed operations

### Data Integrity
- Database constraints and validations
- Backup systems before destructive operations
- Audit trails for all file operations
- Automatic data migration handling

### User Experience Testing
- Cross-browser compatibility
- Mobile responsiveness
- Loading states and feedback
- Accessibility considerations

## Maintenance & Operations

### Monitoring
- File operation logging
- Database query monitoring
- Error tracking and reporting
- User activity analytics

### Backup & Recovery
- Automated backup creation
- Point-in-time recovery capability
- Data export functionality
- File cleanup and maintenance tools

### Scalability Considerations
- Database connection pooling
- Efficient query patterns
- File storage optimization
- Caching strategy implementation

## Development Workflow

### Code Organization
```
project/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Application pages
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions
├── server/               # Express backend
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Database operations
│   ├── auth.ts           # Authentication logic
│   └── fileLogger.ts     # File operation logging
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database schema and types
├── attached_assets/      # CSV data files
├── uploads/              # Temporary upload directory
└── cleanup-files.js      # File maintenance utility
```

### Development Commands
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run db:push          # Apply database schema changes
node cleanup-files.js    # File maintenance operations
```

## Success Criteria

The completed application should provide:

1. **Functional Requirements**
   - All 5 core applications working seamlessly
   - Complete data management workflow
   - Professional PDF generation
   - Comprehensive admin tools

2. **Technical Requirements**
   - Type-safe throughout with TypeScript
   - Responsive design on all devices
   - Fast loading times (<3 seconds)
   - Robust error handling

3. **User Experience**
   - Intuitive navigation and workflows
   - Professional visual design
   - Consistent branding and fonts
   - Helpful feedback and notifications

4. **Data Integrity**
   - Safe file operations with logging
   - Automatic backup systems
   - Duplicate detection and cleanup
   - Audit trails for all operations

5. **Security & Compliance**
   - Secure authentication and authorization
   - Protected file operations
   - Data validation throughout
   - Comprehensive error handling

This specification provides a complete blueprint for recreating the 4S Graphics Pricing Intelligence Platform with all features, technical requirements, and implementation details.