# Quote Calculator & CRM Application

## Overview
This full-stack TypeScript sales management application streamlines sales processes, enhances customer relationship management, and optimizes pricing for a specialty products business. It integrates with Odoo ERP, Gmail, and Shopify to provide comprehensive sales, quoting, and CRM functionalities.

**Key Capabilities:**
- Generate detailed quotes with tiered pricing and PDF output.
- Manage customer relationships, including journey tracking and machine profiles.
- Visualize and manage leads through a sales pipeline.
- Provide daily coaching for sales representatives via the SPOTLIGHT system.
- Conduct email drip campaigns and track engagement.
- Offer an AI chatbot with hybrid RAG for support.
- Employ a "Best Price Engine" for margin protection and volume discounts.

## User Preferences
- **Communication style**: Simple, everyday language
- **Avoid**: Technical jargon in user-facing text
- **UI priority**: Clean, professional, low eye-strain

## System Architecture

**Core Technologies:**
- **Frontend:** React with TypeScript, using TanStack Query.
- **Backend:** Node.js with Express.js, written in TypeScript.
- **Database:** PostgreSQL, managed with Drizzle ORM.

**Key Architectural Decisions & Features:**
- **UI/UX Design:** "Pastel & Soft" theme with a cream background, glassmorphism cards, and muted purple accents for reduced eye strain.
- **Data Flow:** Clear separation between frontend, backend, database, and external APIs.
- **Odoo V19 Integration:** Synchronizes customer, product, pricelist, and order data, distinguishing between Odoo "Customers" (companies) and "Contacts" (individuals). Handles Odoo V19 field limitations.
- **Email as Universal ID:** Normalized email format for consistent cross-platform user identification.
- **SPOTLIGHT Coaching System:** Generates prioritized daily tasks for sales reps.
    - **Sequenced Task Pattern:** 50 tasks/day in 5 repeating cycles focusing on data hygiene, quote follow-up, trust-building, and lapsed customer engagement.
    - **Fallback Priority:** Connect with leads, follow up on quotes, contact customers, send mailers/samples when primary buckets are exhausted.
    - **Task Buckets:** Organizes tasks by difficulty and type.
    - **Lead Integration:** Integrates leads based on urgency and stage.
    - **Cross-User Contact Prevention:** Prevents multiple reps from contacting the same entity simultaneously.
    - **Territory Skip Tracking:** Allows reps to mark "Not My Territory" for reassignment or admin review.
    - **Bounced Email Detection:** Scans Gmail for bounce notifications, creating high-priority hygiene tasks.
    - **Remind Me Again Today:** Defers tasks to a "Later Today Scratch Pad."
    - **Session State Persistence:** Preserves progress across sessions.
    - **Performance Optimization:** Task prefetch cache, exclude list caching, piggyback pattern for responses, and `setQueryData` for instant UI updates.
    - **DRIP Email Integration:** Surfaces urgent drip campaign replies and stale follow-ups as high-priority tasks.
    - **Differentiated Task Cards:** Visually distinct task cards with color-coded badges for email event types (e.g., PO, Samples) and coaching tips.
    - **Email Intelligence → Spotlight Bridge:** Email Event Extractor (regex) and Gmail Insights (OpenAI-analyzed) feed sales signals into Spotlight tasks.
    - **Odoo Quotation/Sample Order Follow-up:** Generates follow-up tasks for pending Odoo quotes and sample orders based on specific criteria.
    - **Coaching Compliance Metric:** Executive culture metric (weighted composite score of task completion, timeliness, calls vs. goal) with color-coded performance indicators and detailed breakdowns.
    - **Today's Progress Bars:** Five dedicated progress bars tracking daily activities: Quotes FollowedUp, SwatchBooks, Calls, Emails, and Data Hygiene.
- **Shared Batch Address Label Printing:** Team-wide queue for printing address labels for contacts/leads. Supports 4x6 Thermal and Letter 30-up formats. Logs activity based on item sent.
- **Win Path Visualization:** Displays the chronological sequence of interactions leading to Shopify orders on customer detail pages, including interaction counts and time-from-first-touch.
- **Automatic Lead-to-Customer Conversion:** Automatically converts leads to customers when a Shopify order (over $50) is placed by a matching email, logging activity and mapping lead fields.
- **Lead-Contact Parity & Company Auto-Linking:** `companies` table links `leads` and `customers` to shared company records. Company domain extracted from email. Odoo synchronization for companies is two-phase.
- **Sales Rep Dropdown Consistency:** All sales rep dropdowns consistently use `/api/sales-reps`, which pulls from Odoo and applies server-side filters to exclude non-sales users or internal accounts.
- **Odoo Pricelist → Local `pricingTier` Sync:** Correctly maps Odoo's `property_product_pricelist` to the local `customers.pricing_tier` during import and resync to prevent false-positive hygiene tasks.
- **Gmail Sent Mail Auto-Activity Sync:** Automatically logs sent emails from Gmail as activity events on corresponding customer/lead records.

## External Dependencies

- **Odoo V19 ERP:** For customer data, product catalogs, pricelists, and orders.
- **Gmail API:** For email intelligence, drip campaigns, engagement tracking, and bounce detection.
- **OpenAI API:** Powers the AI chatbot with hybrid RAG.
- **Shopify:** For e-commerce data and storefront management.
- **PostgreSQL:** Primary database.