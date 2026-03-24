CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"user_name" varchar(255),
	"user_role" varchar(20) NOT NULL,
	"action" varchar(100) NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"target_id" varchar,
	"target_type" varchar(50),
	"status" varchar(20) DEFAULT 'completed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_type" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"entity_id" varchar(100),
	"entity_name" varchar(255),
	"before_data" jsonb,
	"after_data" jsonb,
	"user_id" varchar NOT NULL,
	"user_email" varchar(255),
	"ip_address" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"group_id" integer,
	"compatible_machine_types" text[],
	"description" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "admin_category_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"color" varchar(20),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_category_groups_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "admin_category_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"code" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_coaching_timers" (
	"id" serial PRIMARY KEY NOT NULL,
	"timer_key" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"value_days" integer NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_coaching_timers_timer_key_unique" UNIQUE("timer_key")
);
--> statement-breakpoint
CREATE TABLE "admin_config_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_type" varchar(50) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"config_data" jsonb NOT NULL,
	"published_by" varchar,
	"published_at" timestamp,
	"validation_errors" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_conversation_scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"script_key" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"stage" varchar(50) NOT NULL,
	"persona" varchar(50) NOT NULL,
	"situation" varchar(100),
	"script_content" text NOT NULL,
	"talking_points" text[],
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_conversation_scripts_script_key_unique" UNIQUE("script_key")
);
--> statement-breakpoint
CREATE TABLE "admin_machine_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"icon" varchar(50),
	"description" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_machine_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "admin_nudge_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"nudge_key" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"priority" integer DEFAULT 50 NOT NULL,
	"severity" varchar(20) DEFAULT 'medium' NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"description" text,
	"trigger_conditions" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_nudge_settings_nudge_key_unique" UNIQUE("nudge_key")
);
--> statement-breakpoint
CREATE TABLE "admin_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now(),
	"updated_by_user_id" varchar,
	CONSTRAINT "admin_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "admin_sku_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule_type" varchar(20) DEFAULT 'exact' NOT NULL,
	"pattern" varchar(255) NOT NULL,
	"category_id" integer,
	"category_code" varchar(100),
	"priority" integer DEFAULT 0,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_cost_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"api_provider" varchar(50) NOT NULL,
	"model" varchar(100),
	"operation" varchar(100) NOT NULL,
	"function_name" varchar(255),
	"input_tokens" integer DEFAULT 0,
	"output_tokens" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"estimated_cost" numeric(10, 6) DEFAULT '0',
	"request_duration_ms" integer,
	"success" boolean DEFAULT true,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bounced_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"bounced_email" varchar(255) NOT NULL,
	"bounced_email_normalized" varchar(255) NOT NULL,
	"bounce_subject" varchar(500),
	"bounce_date" timestamp NOT NULL,
	"bounce_reason" text,
	"gmail_message_id" varchar(100) NOT NULL,
	"detected_by" varchar NOT NULL,
	"customer_id" varchar,
	"contact_id" integer,
	"lead_id" integer,
	"match_type" varchar(20),
	"status" varchar(20) DEFAULT 'pending',
	"investigate_until" timestamp,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"resolution" varchar(50),
	"bounce_type" varchar(30),
	"outreach_history_snapshot" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "catalog_import_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"imported_by" varchar(255),
	"imported_by_email" varchar(255),
	"categories_created" integer DEFAULT 0,
	"categories_updated" integer DEFAULT 0,
	"product_types_created" integer DEFAULT 0,
	"product_types_updated" integer DEFAULT 0,
	"variants_created" integer DEFAULT 0,
	"variants_updated" integer DEFAULT 0,
	"errors" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "catalog_product_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"code" varchar(255) NOT NULL,
	"label" varchar(255) NOT NULL,
	"subfamily" varchar(100),
	"description" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "catalog_product_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "category_objections" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"category_trust_id" integer,
	"category_name" varchar(100) NOT NULL,
	"objection_type" varchar(50) NOT NULL,
	"details" text,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "category_trust" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"category_code" varchar(100) NOT NULL,
	"category_name" varchar(100),
	"machine_type" varchar(100),
	"trust_level" varchar(50) DEFAULT 'unknown' NOT NULL,
	"samples_sent" integer DEFAULT 0,
	"samples_approved" integer DEFAULT 0,
	"quotes_sent" integer DEFAULT 0,
	"orders_placed" integer DEFAULT 0,
	"last_sample_date" timestamp,
	"last_order_date" timestamp,
	"first_order_date" timestamp,
	"total_order_value" numeric(12, 2) DEFAULT '0',
	"avg_order_frequency_days" integer,
	"next_reorder_due" timestamp,
	"reorder_status" varchar(50),
	"notes" text,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_moments" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"assigned_to" varchar NOT NULL,
	"action" varchar(100) NOT NULL,
	"why_now" text NOT NULL,
	"priority" integer DEFAULT 50 NOT NULL,
	"scheduled_for" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"outcome" varchar(50),
	"outcome_notes" text,
	"completed_at" timestamp,
	"source_type" varchar(50),
	"source_id" integer,
	"next_moment_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"odoo_company_partner_id" integer,
	"odoo_synced_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "competitor_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"type" varchar(100) NOT NULL,
	"dimensions" varchar(100) NOT NULL,
	"width" numeric(10, 2),
	"length" numeric(10, 2),
	"unit" varchar(10),
	"pack_qty" integer NOT NULL,
	"input_price" numeric(10, 2) NOT NULL,
	"price_per_sheet" numeric(10, 4),
	"thickness" varchar(50) NOT NULL,
	"product_kind" varchar(100) NOT NULL,
	"surface_finish" varchar(100) NOT NULL,
	"supplier_info" varchar(255) NOT NULL,
	"info_received_from" varchar(255) NOT NULL,
	"price_per_sq_in" numeric(10, 4) NOT NULL,
	"price_per_sq_ft" numeric(10, 4) NOT NULL,
	"price_per_sq_meter" numeric(10, 4) NOT NULL,
	"notes" text NOT NULL,
	"source" varchar(100) NOT NULL,
	"added_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_activity_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"source_type" varchar(50),
	"source_id" varchar,
	"source_table" varchar(50),
	"amount" numeric(10, 2),
	"item_count" integer,
	"product_id" integer,
	"product_name" varchar(255),
	"created_by" varchar,
	"created_by_name" varchar(255),
	"metadata" jsonb,
	"event_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_coach_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"current_state" varchar(50) DEFAULT 'prospect' NOT NULL,
	"state_confidence" integer DEFAULT 0,
	"primary_category_code" varchar(100),
	"total_lifetime_value" numeric(12, 2) DEFAULT '0',
	"total_orders" integer DEFAULT 0,
	"avg_order_value" numeric(10, 2),
	"days_since_last_order" integer,
	"days_since_last_contact" integer,
	"next_nudge_action" varchar(100),
	"next_nudge_reason" text,
	"next_nudge_priority" varchar(20) DEFAULT 'normal',
	"next_nudge_due_date" timestamp,
	"stuck_category_code" varchar(100),
	"stuck_days" integer,
	"last_state_change" timestamp,
	"last_calculated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_coach_state_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "customer_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"email_normalized" varchar(320),
	"phone" varchar(50),
	"role" varchar(100),
	"is_primary" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_do_not_merge" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id_1" varchar NOT NULL,
	"customer_id_2" varchar NOT NULL,
	"marked_by" varchar(255),
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_engagement_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"last_contact_date" timestamp,
	"days_since_last_contact" integer,
	"total_contacts_last_30_days" integer DEFAULT 0,
	"total_contacts_last_90_days" integer DEFAULT 0,
	"total_quotes_sent" integer DEFAULT 0,
	"quotes_last_30_days" integer DEFAULT 0,
	"last_quote_date" timestamp,
	"open_quotes_count" integer DEFAULT 0,
	"quotes_without_follow_up" integer DEFAULT 0,
	"total_samples_sent" integer DEFAULT 0,
	"samples_last_90_days" integer DEFAULT 0,
	"last_sample_date" timestamp,
	"samples_without_conversion" integer DEFAULT 0,
	"products_exposed_count" integer DEFAULT 0,
	"product_categories_exposed" text[] DEFAULT '{}',
	"engagement_score" integer DEFAULT 0,
	"engagement_trend" varchar(20),
	"needs_attention" boolean DEFAULT false,
	"attention_reason" varchar(255),
	"last_calculated_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_engagement_summary_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "customer_journey" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"journey_stage" varchar(50) DEFAULT 'trigger',
	"primary_product_line" varchar(100),
	"current_supplier" varchar(255),
	"estimated_annual_volume" numeric(12, 2),
	"quotes_received" integer DEFAULT 0,
	"price_list_views" integer DEFAULT 0,
	"last_quote_date" timestamp,
	"last_price_list_view" timestamp,
	"stage_updated_at" timestamp DEFAULT now(),
	"assigned_sales_rep" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_journey_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "customer_journey_instances" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"journey_type" varchar(50) NOT NULL,
	"template_id" integer,
	"current_step" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_journey_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"stage" varchar(50) NOT NULL,
	"completed_at" timestamp,
	"completed_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_journey_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"instance_id" integer NOT NULL,
	"step_key" varchar(50) NOT NULL,
	"completed_at" timestamp,
	"completed_by" varchar,
	"payload" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_machine_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"machine_family" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'inferred' NOT NULL,
	"source" varchar(100),
	"other_details" text,
	"touch_count" integer DEFAULT 0,
	"confirmed_at" timestamp,
	"confirmed_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_sync_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"odoo_partner_id" integer NOT NULL,
	"field_name" varchar(100) NOT NULL,
	"old_value" text,
	"new_value" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"changed_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"email" varchar(255),
	"email_normalized" varchar(320),
	"email2" varchar(255),
	"email2_normalized" varchar(320),
	"accepts_email_marketing" boolean DEFAULT false,
	"company" varchar(255),
	"address1" varchar(255),
	"address2" varchar(255),
	"city" varchar(255),
	"province" varchar(255),
	"country" varchar(255),
	"zip" varchar(20),
	"phone" varchar(50),
	"phone2" varchar(50),
	"cell" varchar(50),
	"website" varchar(255),
	"default_address_phone" varchar(50),
	"accepts_sms_marketing" boolean DEFAULT false,
	"total_spent" numeric(10, 2) DEFAULT '0',
	"total_orders" integer DEFAULT 0,
	"note" text,
	"tax_exempt" boolean DEFAULT false,
	"tags" varchar(500),
	"sources" text[] DEFAULT '{}',
	"paused_until" timestamp,
	"pause_reason" varchar(100),
	"is_hot_prospect" boolean DEFAULT false,
	"sales_rep_id" varchar,
	"sales_rep_name" varchar(255),
	"pricing_tier" varchar(50),
	"pricing_tier_set_by" varchar(255),
	"pricing_tier_set_at" timestamp,
	"last_odoo_sync_at" timestamp,
	"odoo_partner_id" integer,
	"odoo_write_date" timestamp,
	"odoo_sync_status" varchar(20) DEFAULT 'synced',
	"odoo_pending_changes" jsonb,
	"odoo_last_sync_error" text,
	"odoo_parent_id" integer,
	"parent_customer_id" varchar,
	"contact_type" varchar(50),
	"is_company" boolean DEFAULT false,
	"do_not_contact" boolean DEFAULT false,
	"do_not_contact_reason" varchar(255),
	"do_not_contact_set_by" varchar(255),
	"do_not_contact_set_at" timestamp,
	"last_outbound_email_at" timestamp,
	"swatchbook_sent_at" timestamp,
	"press_test_sent_at" timestamp,
	"price_list_sent_at" timestamp,
	"customer_type" varchar(50),
	"spotlight_meta" jsonb,
	"company_domain" text,
	"job_title" varchar(255),
	"company_id" integer,
	"odoo_company_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_user_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"purchase_orders_received" integer DEFAULT 0,
	"pricing_approvals_received" integer DEFAULT 0,
	"quotes_created" integer DEFAULT 0,
	"follow_ups_completed" integer DEFAULT 0,
	"emails_sent" integer DEFAULT 0,
	"new_customers_added" integer DEFAULT 0,
	"coaching_tip" text,
	"celebration_shown" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deleted_customer_exclusions" (
	"id" serial PRIMARY KEY NOT NULL,
	"odoo_partner_id" integer,
	"shopify_customer_id" varchar(100),
	"original_customer_id" varchar(255),
	"company_name" varchar(255),
	"email" varchar(255),
	"deleted_by" varchar(255) NOT NULL,
	"reason" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drip_campaign_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"customer_id" varchar,
	"lead_id" integer,
	"status" varchar(20) DEFAULT 'active',
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"paused_at" timestamp,
	"cancelled_at" timestamp,
	"assigned_by" varchar(255),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drip_campaign_step_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"step_id" integer NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled',
	"sent_at" timestamp,
	"email_send_id" integer,
	"gmail_message_id" varchar(255),
	"gmail_thread_id" varchar(100),
	"last_error" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drip_campaign_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"step_order" integer DEFAULT 1 NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"delay_amount" integer DEFAULT 0 NOT NULL,
	"delay_unit" varchar(20) DEFAULT 'days',
	"template_id" integer,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drip_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT false,
	"trigger_type" varchar(50) DEFAULT 'manual',
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_intelligence_blacklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"pattern" varchar(255) NOT NULL,
	"pattern_type" varchar(20) DEFAULT 'email' NOT NULL,
	"reason" text,
	"added_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_sales_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"gmail_message_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"customer_id" varchar,
	"event_type" varchar(50) NOT NULL,
	"confidence" numeric(3, 2) NOT NULL,
	"trigger_text" text,
	"trigger_keywords" text,
	"occurred_at" timestamp NOT NULL,
	"follow_up_task_id" integer,
	"coaching_tip" text,
	"is_processed" boolean DEFAULT false,
	"processed_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_sends" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer,
	"recipient_email" varchar(255) NOT NULL,
	"recipient_name" varchar(255),
	"customer_id" varchar,
	"lead_id" integer,
	"subject" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"variable_data" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(50) DEFAULT 'sent',
	"sent_by" varchar(255),
	"sent_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255),
	"title" varchar(255),
	"phone" varchar(50),
	"signature_html" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "email_signatures_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subject" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"category" varchar(100) DEFAULT 'general',
	"usage_type" varchar(50) DEFAULT 'client_email',
	"variables" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_tracking_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_id" integer NOT NULL,
	"event_type" varchar(20) NOT NULL,
	"link_url" text,
	"link_text" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_tracking_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" varchar(64) NOT NULL,
	"email_send_id" integer,
	"customer_id" varchar,
	"lead_id" integer,
	"recipient_email" varchar(255) NOT NULL,
	"subject" varchar(500),
	"sent_by" varchar(255),
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"first_opened_at" timestamp,
	"last_opened_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "email_tracking_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "file_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_file_name" varchar(255) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_by" varchar NOT NULL,
	"uploaded_at" timestamp DEFAULT now(),
	"records_processed" integer DEFAULT 0,
	"records_added" integer DEFAULT 0,
	"records_updated" integer DEFAULT 0,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "follow_up_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"default_delay_days" integer DEFAULT 1 NOT NULL,
	"default_priority" varchar(20) DEFAULT 'normal',
	"task_title" varchar(255) NOT NULL,
	"task_description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "follow_up_config_event_type_unique" UNIQUE("event_type")
);
--> statement-breakpoint
CREATE TABLE "follow_up_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"task_type" varchar(50) NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"due_date" timestamp NOT NULL,
	"reminder_date" timestamp,
	"snoozed_until" timestamp,
	"source_event_id" integer,
	"source_type" varchar(50),
	"source_id" varchar,
	"assigned_to" varchar,
	"assigned_to_name" varchar(255),
	"completed_at" timestamp,
	"completed_by" varchar,
	"completion_notes" text,
	"is_auto_generated" boolean DEFAULT false,
	"calendar_event_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gmail_deliverability_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"emails_sent" integer DEFAULT 0,
	"emails_opened" integer DEFAULT 0,
	"emails_clicked" integer DEFAULT 0,
	"bounces" integer DEFAULT 0,
	"spam_reports" integer DEFAULT 0,
	"open_rate" numeric(5, 2),
	"click_rate" numeric(5, 2),
	"bounce_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gmail_email_aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"primary_email_normalized" varchar(320) NOT NULL,
	"alias_email_normalized" varchar(320) NOT NULL,
	"customer_id" varchar,
	"contact_id" integer,
	"is_verified" boolean DEFAULT false,
	"source" varchar(50) DEFAULT 'auto',
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gmail_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"customer_id" varchar,
	"insight_type" varchar(50) NOT NULL,
	"summary" text NOT NULL,
	"details" text,
	"confidence" numeric(3, 2),
	"due_date" timestamp,
	"priority" varchar(10) DEFAULT 'medium',
	"status" varchar(20) DEFAULT 'pending',
	"completed_at" timestamp,
	"completed_by" varchar(255),
	"dismissed_at" timestamp,
	"dismissed_reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gmail_message_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"gmail_message_id" integer NOT NULL,
	"customer_id" varchar NOT NULL,
	"contact_id" integer,
	"match_type" varchar(30) NOT NULL,
	"matched_email" varchar(255),
	"matched_email_normalized" varchar(320),
	"confidence" numeric(3, 2) NOT NULL,
	"is_confirmed" boolean DEFAULT false,
	"confirmed_by" varchar(255),
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gmail_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"gmail_message_id" varchar(100) NOT NULL,
	"thread_id" varchar(100),
	"direction" varchar(10) NOT NULL,
	"from_email" varchar(255),
	"from_email_normalized" varchar(320),
	"from_name" varchar(255),
	"to_email" varchar(255),
	"to_email_normalized" varchar(320),
	"to_name" varchar(255),
	"cc_emails" text,
	"cc_emails_normalized" text,
	"subject" varchar(1000),
	"snippet" text,
	"body_text" text,
	"sent_at" timestamp,
	"customer_id" varchar,
	"contact_id" integer,
	"match_confidence" numeric(3, 2),
	"match_type" varchar(30),
	"matched_email_normalized" varchar(320),
	"analysis_status" varchar(20) DEFAULT 'pending',
	"analyzed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gmail_sync_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"last_history_id" varchar(100),
	"last_synced_at" timestamp,
	"sync_status" varchar(20) DEFAULT 'idle',
	"last_error" text,
	"messages_processed" integer DEFAULT 0,
	"insights_extracted" integer DEFAULT 0,
	"last_query" text,
	"threads_found" integer DEFAULT 0,
	"messages_stored" integer DEFAULT 0,
	"matched_to_customers" integer DEFAULT 0,
	"unmatched_count" integer DEFAULT 0,
	"events_extracted" integer DEFAULT 0,
	"sync_started_at" timestamp,
	"sync_completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gmail_unmatched_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"gmail_message_id" integer NOT NULL,
	"user_id" varchar,
	"email" varchar(255) NOT NULL,
	"email_normalized" varchar(320),
	"domain" varchar(255),
	"sender_name" varchar(255),
	"message_date" timestamp,
	"subject" varchar(500),
	"match_attempts" integer DEFAULT 1,
	"last_attempt_at" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'pending',
	"linked_customer_id" varchar,
	"linked_contact_id" integer,
	"linked_by" varchar(255),
	"linked_at" timestamp,
	"ignored_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journey_template_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"position" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"guidance" text,
	"color" varchar(20),
	"confidence_level" integer,
	"overdue_days" integer,
	"auto_close_days" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journey_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_system_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "journey_templates_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "label_prints" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"label_type" varchar(30) NOT NULL,
	"other_description" varchar(255),
	"quantity" integer DEFAULT 1 NOT NULL,
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(255),
	"province" varchar(255),
	"country" varchar(255),
	"postal_code" varchar(50),
	"printed_by_user_id" varchar NOT NULL,
	"printed_by_user_name" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "label_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar(255),
	"lead_id" integer,
	"added_by" varchar(255),
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"summary" varchar(500) NOT NULL,
	"details" text,
	"performed_by" varchar(255),
	"performed_by_name" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"odoo_lead_id" integer,
	"source_type" varchar(50) DEFAULT 'manual' NOT NULL,
	"source_customer_id" varchar,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"email_normalized" varchar(320),
	"phone" varchar(50),
	"mobile" varchar(50),
	"company" varchar(255),
	"job_title" varchar(255),
	"website" varchar(255),
	"street" varchar(255),
	"street2" varchar(255),
	"city" varchar(255),
	"state" varchar(255),
	"zip" varchar(20),
	"country" varchar(255),
	"stage" varchar(50) DEFAULT 'new' NOT NULL,
	"priority" varchar(10) DEFAULT 'medium',
	"score" integer DEFAULT 0,
	"probability" integer DEFAULT 10,
	"expected_revenue" numeric(10, 2),
	"first_email_sent_at" timestamp,
	"first_email_reply_at" timestamp,
	"swatchbook_sent_at" timestamp,
	"sample_sent_at" timestamp,
	"price_list_sent_at" timestamp,
	"catalog_sent_at" timestamp,
	"one_page_mailer_sent_at" timestamp,
	"sample_envelope_sent_at" timestamp,
	"press_test_kit_sent_at" timestamp,
	"last_mailer_sent_at" timestamp,
	"last_mailer_type" varchar(50),
	"mailer_trigger_email_open_count" integer DEFAULT 0,
	"first_contact_at" timestamp,
	"last_contact_at" timestamp,
	"total_touchpoints" integer DEFAULT 0,
	"preferred_contact" varchar(50),
	"best_time_to_call" varchar(100),
	"description" text,
	"internal_notes" text,
	"lost_reason" varchar(255),
	"sales_rep_id" varchar,
	"sales_rep_name" varchar(255),
	"pricing_tier" varchar(50),
	"pricing_tier_set_by" varchar(255),
	"pricing_tier_set_at" timestamp,
	"customer_type" varchar(50),
	"machine_types" text[] DEFAULT '{}',
	"tags" varchar(500),
	"odoo_write_date" timestamp,
	"last_odoo_sync_at" timestamp,
	"exists_in_odoo_as_contact" boolean DEFAULT false,
	"exists_in_shopify" boolean DEFAULT false,
	"source_contact_odoo_partner_id" integer,
	"is_company" boolean DEFAULT false,
	"primary_contact_name" varchar(255),
	"primary_contact_email" varchar(255),
	"odoo_partner_id" integer,
	"company_domain" text,
	"company_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mailer_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"thumbnail_path" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"url" varchar(1000) NOT NULL,
	"uploaded_by" varchar(255),
	"used_in" varchar(50) DEFAULT 'drip_email',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "odoo_price_sync_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"mapping_id" integer NOT NULL,
	"item_code" varchar(100) NOT NULL,
	"odoo_product_id" integer NOT NULL,
	"price_tier" varchar(50) NOT NULL,
	"current_odoo_price" numeric(10, 2),
	"new_price" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"requested_by" varchar(255),
	"requested_at" timestamp DEFAULT now(),
	"approved_by" varchar(255),
	"approved_at" timestamp,
	"synced_at" timestamp,
	"sync_error" text
);
--> statement-breakpoint
CREATE TABLE "opportunity_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar,
	"lead_id" integer,
	"score" integer DEFAULT 0 NOT NULL,
	"opportunity_type" varchar(50) NOT NULL,
	"signals" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"last_calculated_at" timestamp DEFAULT now(),
	"follow_up_sequence_step" integer DEFAULT 0,
	"next_follow_up_at" timestamp,
	"last_follow_up_at" timestamp,
	"follow_up_history" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parsed_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text DEFAULT '',
	"city" text DEFAULT '',
	"state" varchar(2) DEFAULT '',
	"zip" varchar(10) DEFAULT '',
	"country" text DEFAULT 'USA',
	"phone" varchar(20) DEFAULT '',
	"email" text DEFAULT '',
	"website" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdf_category_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_key" varchar(50) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"logo_file" varchar(255),
	"features_main" text,
	"features_sub" text,
	"compatible_with" text,
	"matches_pattern" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	"updated_by" varchar,
	CONSTRAINT "pdf_category_details_category_key_unique" UNIQUE("category_key")
);
--> statement-breakpoint
CREATE TABLE "press_kit_shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"press_kit_version" varchar(50),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"shipped_at" timestamp,
	"received_at" timestamp,
	"tracking_number" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "press_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"press_manufacturer" varchar(255),
	"press_model" varchar(255),
	"press_type" varchar(100),
	"ink_type" varchar(100),
	"substrate_focus" text,
	"max_sheet_width" numeric(10, 2),
	"max_sheet_length" numeric(10, 2),
	"coater_type" varchar(100),
	"dryer_type" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "press_test_journey_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"instance_id" integer NOT NULL,
	"product_id" integer,
	"product_name" varchar(255),
	"size_requested" varchar(100),
	"quantity_requested" integer,
	"tracking_number" varchar(100),
	"shipped_at" timestamp,
	"received_at" timestamp,
	"result" varchar(50),
	"result_feedback" text,
	"sample_request_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "press_test_journey_details_instance_id_unique" UNIQUE("instance_id")
);
--> statement-breakpoint
CREATE TABLE "price_list_event_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"item_code" varchar(50) NOT NULL,
	"product_type" varchar(255),
	"size" varchar(100),
	"min_qty" integer,
	"price_per_unit" numeric(10, 4),
	"price_per_pack" numeric(10, 4),
	"shipping_cost" numeric(10, 4),
	"price_tier" varchar(50),
	"category" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "price_list_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar,
	"event_type" varchar(50) NOT NULL,
	"price_tier" varchar(50),
	"product_types" text[],
	"user_id" varchar,
	"user_email" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "product_competitor_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"competitor_pricing_id" integer NOT NULL,
	"match_confidence" varchar(20) DEFAULT 'manual',
	"status" varchar(20) DEFAULT 'active',
	"notes" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_exposure_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"product_id" integer,
	"product_name" varchar(255) NOT NULL,
	"product_category" varchar(100),
	"exposure_type" varchar(50) NOT NULL,
	"source_id" varchar,
	"customer_interest" varchar(50),
	"has_ordered" boolean DEFAULT false,
	"order_date" timestamp,
	"shared_by" varchar,
	"shared_by_name" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_name" text NOT NULL,
	"sku" text,
	"description" text,
	"price" text,
	"barcode" text,
	"website_url" text,
	"is_sample_pack" boolean DEFAULT false NOT NULL,
	"print_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"label_format" text DEFAULT 'thermal4x3' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_merge_suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"local_product_id" integer NOT NULL,
	"odoo_default_code" varchar(100) NOT NULL,
	"odoo_product_name" varchar(255),
	"odoo_product_id" integer,
	"match_score" numeric(5, 4) NOT NULL,
	"match_type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_odoo_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_code" varchar(100) NOT NULL,
	"odoo_product_id" integer NOT NULL,
	"odoo_default_code" varchar(100),
	"odoo_product_name" varchar(255),
	"sync_status" varchar(20) DEFAULT 'mapped' NOT NULL,
	"last_synced_at" timestamp,
	"last_sync_error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" varchar(255),
	CONSTRAINT "product_odoo_mappings_item_code_unique" UNIQUE("item_code")
);
--> statement-breakpoint
CREATE TABLE "product_pricing_master" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_code" varchar(100) NOT NULL,
	"odoo_item_code" varchar(100),
	"product_name" varchar(255) NOT NULL,
	"product_type" varchar(255) NOT NULL,
	"product_type_id" integer,
	"catalog_category_id" integer,
	"catalog_product_type_id" integer,
	"size" varchar(100) NOT NULL,
	"total_sqm" numeric(10, 6) NOT NULL,
	"min_quantity" integer DEFAULT 50 NOT NULL,
	"roll_sheet" varchar(10),
	"unit_of_measure" varchar(20),
	"landed_price" numeric(10, 2),
	"export_price" numeric(10, 2),
	"master_distributor_price" numeric(10, 2),
	"dealer_price" numeric(10, 2),
	"dealer2_price" numeric(10, 2),
	"approval_needed_price" numeric(10, 2),
	"tier_stage25_price" numeric(10, 2),
	"tier_stage2_price" numeric(10, 2),
	"tier_stage15_price" numeric(10, 2),
	"tier_stage1_price" numeric(10, 2),
	"retail_price" numeric(10, 2),
	"upload_batch" varchar(100),
	"row_hash" varchar(64),
	"sort_order" integer,
	"is_archived" boolean DEFAULT false,
	"merge_parent_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_pricing_master_item_code_unique" UNIQUE("item_code")
);
--> statement-breakpoint
CREATE TABLE "product_sizes" (
	"id" serial PRIMARY KEY NOT NULL,
	"type_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"width" numeric(10, 2) NOT NULL,
	"height" numeric(10, 2) NOT NULL,
	"width_unit" varchar(10) NOT NULL,
	"height_unit" varchar(10) NOT NULL,
	"square_meters" numeric(10, 4) NOT NULL,
	"item_code" varchar(50),
	"min_order_qty" integer DEFAULT 50
);
--> statement-breakpoint
CREATE TABLE "product_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "quote_category_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"quote_id" integer,
	"quote_number" varchar(50),
	"category_name" varchar(100) NOT NULL,
	"follow_up_stage" varchar(50) DEFAULT 'initial' NOT NULL,
	"next_follow_up_due" timestamp,
	"last_follow_up_at" timestamp,
	"follow_up_count" integer DEFAULT 0,
	"outcome" varchar(50),
	"urgency_score" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"quote_id" integer,
	"quote_number" varchar(50),
	"event_type" varchar(50) NOT NULL,
	"total_amount" numeric(10, 2),
	"item_count" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sample_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"product_id" integer,
	"product_name" varchar(255),
	"competitor_paper" varchar(255),
	"job_description" text,
	"planned_test_date" timestamp,
	"test_owner_name" varchar(255),
	"test_owner_role" varchar(100),
	"quantity" integer,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"tracking_number" varchar(100),
	"shipped_at" timestamp,
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sample_shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar,
	"lead_id" integer,
	"source" varchar(30) NOT NULL,
	"source_order_id" varchar(100),
	"source_order_name" varchar(255),
	"shipped_at" timestamp NOT NULL,
	"estimated_delivery_at" timestamp,
	"delivery_state" varchar(50),
	"estimated_transit_days" integer,
	"follow_up_status" varchar(30) DEFAULT 'pending' NOT NULL,
	"follow_up_step" integer DEFAULT 0,
	"last_follow_up_at" timestamp,
	"follow_up_history" jsonb DEFAULT '[]'::jsonb,
	"order_amount" numeric(10, 2) DEFAULT '0',
	"client_ref" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sent_quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_number" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255),
	"quote_items" text NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sent_via" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'sent' NOT NULL,
	"owner_email" varchar(255),
	"follow_up_due_at" timestamp,
	"outcome" varchar(20) DEFAULT 'pending',
	"outcome_notes" text,
	"competitor_name" varchar(255),
	"objection_summary" text,
	"outcome_updated_at" timestamp,
	"outcome_updated_by" varchar(255),
	"reminder_count" integer DEFAULT 0,
	"lost_notification_sent" boolean DEFAULT false,
	"source" varchar(50) DEFAULT 'quickquote',
	"shopify_draft_order_id" varchar(100),
	"shopify_checkout_id" varchar(100),
	"shopify_order_id" varchar(100),
	"priority" varchar(20) DEFAULT 'normal',
	"customer_id" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment_follow_up_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"customer_id" varchar,
	"gmail_message_id" integer,
	"thread_id" varchar(100),
	"shipment_type" varchar(50) NOT NULL,
	"carrier" varchar(50),
	"tracking_number" varchar(100),
	"subject" varchar(500),
	"recipient_email" varchar(255),
	"recipient_name" varchar(255),
	"customer_company" varchar(255),
	"sent_at" timestamp,
	"follow_up_due_date" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"reply_received" boolean DEFAULT false,
	"reply_received_at" timestamp,
	"completed_at" timestamp,
	"dismissed_at" timestamp,
	"dismissed_reason" text,
	"last_reminder_at" timestamp,
	"reminder_count" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"ship_from" text NOT NULL,
	"company_name" text,
	"ship_to" text,
	"invoice_number" text,
	"invoice_date" text,
	"client_po" text,
	"pallet_count" integer NOT NULL,
	"pallets" jsonb NOT NULL,
	"format" text NOT NULL,
	"ship_via" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shopify_customer_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopify_email" varchar(255),
	"shopify_company_name" varchar(255),
	"shopify_customer_id" varchar(100),
	"crm_customer_id" varchar(100) NOT NULL,
	"crm_customer_name" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopify_draft_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"sent_quote_id" integer,
	"quote_number" varchar(50),
	"customer_id" varchar(100),
	"customer_email" varchar(255),
	"shopify_draft_order_id" varchar(100),
	"shopify_draft_order_number" varchar(50),
	"invoice_url" varchar(1000),
	"status" varchar(50) DEFAULT 'open',
	"total_price" numeric(10, 2),
	"line_items_count" integer,
	"shopify_order_id" varchar(100),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopify_installs" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop" varchar(255) NOT NULL,
	"access_token" varchar(255) NOT NULL,
	"scope" varchar(500),
	"is_active" boolean DEFAULT true,
	"installed_at" timestamp DEFAULT now(),
	"uninstalled_at" timestamp,
	"last_api_call_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "shopify_installs_shop_unique" UNIQUE("shop")
);
--> statement-breakpoint
CREATE TABLE "shopify_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopify_order_id" varchar(100) NOT NULL,
	"shopify_customer_id" varchar(100),
	"customer_id" varchar,
	"order_number" varchar(50),
	"email" varchar(255),
	"customer_name" varchar(255),
	"company_name" varchar(255),
	"total_price" numeric(12, 2),
	"currency" varchar(10) DEFAULT 'USD',
	"financial_status" varchar(50),
	"fulfillment_status" varchar(50),
	"line_items" jsonb,
	"shipping_address" jsonb,
	"billing_address" jsonb,
	"tags" text,
	"note" text,
	"shopify_created_at" timestamp,
	"processed_for_coaching" boolean DEFAULT false,
	"coaching_processed_at" timestamp,
	"odoo_synced" boolean DEFAULT false,
	"odoo_synced_at" timestamp,
	"odoo_order_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "shopify_orders_shopify_order_id_unique" UNIQUE("shopify_order_id")
);
--> statement-breakpoint
CREATE TABLE "shopify_product_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopify_product_title" varchar(255),
	"shopify_product_tag" varchar(255),
	"shopify_product_type" varchar(255),
	"category_name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopify_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_domain" varchar(255),
	"webhook_secret" varchar(255),
	"is_active" boolean DEFAULT false,
	"last_sync_at" timestamp,
	"orders_processed" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopify_unmapped_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopify_order_id" varchar(100) NOT NULL,
	"shopify_line_item_id" varchar(100),
	"sku" varchar(255),
	"product_title" varchar(500),
	"variant_title" varchar(255),
	"quantity" integer DEFAULT 1,
	"price" numeric(10, 2),
	"resolved_category_id" integer,
	"resolved_product_type_id" integer,
	"resolved_item_code" varchar(100),
	"resolved_by" varchar(255),
	"resolved_at" timestamp,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopify_variant_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_pricing_id" integer,
	"item_code" varchar(100),
	"product_name" varchar(255),
	"shopify_product_id" varchar(100),
	"shopify_variant_id" varchar(100) NOT NULL,
	"shopify_product_title" varchar(255),
	"shopify_variant_title" varchar(255),
	"shopify_price" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopify_webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop" varchar(255) NOT NULL,
	"topic" varchar(100) NOT NULL,
	"shopify_id" varchar(100),
	"payload" jsonb NOT NULL,
	"hmac_valid" boolean,
	"processed" boolean DEFAULT false,
	"processed_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spotlight_card_engagements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"card_id" integer NOT NULL,
	"card_type" varchar(30) NOT NULL,
	"selected_answer" integer,
	"selected_response_id" varchar(50),
	"was_correct" boolean,
	"time_spent_ms" integer,
	"skipped" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spotlight_coach_tips" (
	"id" serial PRIMARY KEY NOT NULL,
	"tip_type" varchar(30) NOT NULL,
	"trigger_context" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"machine_type_code" varchar(50),
	"category_code" varchar(50),
	"priority" integer DEFAULT 10,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spotlight_customer_claims" (
	"customer_id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_date" varchar(10) NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spotlight_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"user_id" varchar NOT NULL,
	"customer_id" varchar,
	"bucket" varchar(30) NOT NULL,
	"task_subtype" varchar(50),
	"outcome_id" varchar(50),
	"outcome_label" varchar(100),
	"skip_reason" varchar(100),
	"time_to_action_ms" integer,
	"scheduled_follow_up_days" integer,
	"marked_dnc" boolean DEFAULT false,
	"day_of_week" integer,
	"hour_of_day" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spotlight_micro_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"question" text,
	"options" jsonb,
	"correct_answer" integer,
	"explanation" text,
	"objection_type" varchar(50),
	"suggested_responses" jsonb,
	"category_code" varchar(50),
	"machine_type_code" varchar(50),
	"difficulty" varchar(20) DEFAULT 'medium',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spotlight_session_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_date" varchar(10) NOT NULL,
	"calls_completed" integer DEFAULT 0,
	"calls_target" integer DEFAULT 10,
	"follow_ups_completed" integer DEFAULT 0,
	"follow_ups_target" integer DEFAULT 10,
	"outreach_completed" integer DEFAULT 0,
	"outreach_target" integer DEFAULT 10,
	"data_hygiene_completed" integer DEFAULT 0,
	"data_hygiene_target" integer DEFAULT 10,
	"enablement_completed" integer DEFAULT 0,
	"enablement_target" integer DEFAULT 10,
	"total_completed" integer DEFAULT 0,
	"total_target" integer DEFAULT 50,
	"last_task_types" jsonb DEFAULT '[]'::jsonb,
	"current_energy" integer DEFAULT 100,
	"energy_check_shown" boolean DEFAULT false,
	"combo_count" integer DEFAULT 0,
	"combo_multiplier" numeric(3, 1) DEFAULT '1.0',
	"tasks_completed_today" integer DEFAULT 0,
	"hard_tasks_completed_today" integer DEFAULT 0,
	"power_ups_available" integer DEFAULT 0,
	"power_ups_used_today" integer DEFAULT 0,
	"last_micro_card_at" timestamp,
	"tasks_since_micro_card" integer DEFAULT 0,
	"micro_cards_shown_today" jsonb DEFAULT '[]'::jsonb,
	"warmup_shown" boolean DEFAULT false,
	"recap_shown" boolean DEFAULT false,
	"day_complete" boolean DEFAULT false,
	"current_claimed_customer_id" varchar,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spotlight_snoozes" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"user_id" text NOT NULL,
	"snooze_until" timestamp with time zone,
	"outcome_tag" varchar(30),
	"note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spotlight_team_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"user_id" text NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone NOT NULL,
	"released_at" timestamp with time zone,
	"renewal_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swatch_book_shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"swatch_book_version" varchar(50),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"shipped_at" timestamp,
	"received_at" timestamp,
	"tracking_number" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "swatch_selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"swatch_id" integer NOT NULL,
	"shipment_id" integer,
	"intended_job_name" varchar(255),
	"intended_test_date" timestamp,
	"test_owner" varchar(255),
	"sample_requested" boolean DEFAULT false,
	"sample_request_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "swatches" (
	"id" serial PRIMARY KEY NOT NULL,
	"swatch_code" varchar(50) NOT NULL,
	"product_line" varchar(100),
	"sku" varchar(100),
	"name" varchar(255) NOT NULL,
	"weight" varchar(50),
	"finish" varchar(100),
	"product_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "swatches_swatch_code_unique" UNIQUE("swatch_code")
);
--> statement-breakpoint
CREATE TABLE "territory_skip_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"skipped_by_users" text[] DEFAULT '{}' NOT NULL,
	"total_active_users" integer NOT NULL,
	"flagged_for_admin_review" boolean DEFAULT false,
	"admin_reviewed_at" timestamp,
	"admin_reviewed_by" varchar,
	"admin_decision" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "upload_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"filename" text NOT NULL,
	"upload_date" timestamp DEFAULT now() NOT NULL,
	"records_processed" integer DEFAULT 0,
	"records_added" integer DEFAULT 0,
	"records_updated" integer DEFAULT 0,
	"records_deleted" integer DEFAULT 0,
	"clear_database" boolean DEFAULT false,
	"change_log" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "upload_batches_batch_id_unique" UNIQUE("batch_id")
);
--> statement-breakpoint
CREATE TABLE "user_gmail_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"gmail_address" varchar(255) NOT NULL,
	"gmail_address_normalized" varchar(320),
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expiry" timestamp,
	"scope" text,
	"is_active" boolean DEFAULT true,
	"last_sync_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_gmail_connections_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_tutorial_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"tutorial_id" varchar(100) NOT NULL,
	"status" varchar(20) DEFAULT 'not_started' NOT NULL,
	"current_step" integer DEFAULT 0,
	"total_steps" integer NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"skipped_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"login_count" integer DEFAULT 0,
	"last_login_date" varchar,
	"allowed_tiers" text[],
	"efficiency_score" integer DEFAULT 0,
	"total_tasks_completed" integer DEFAULT 0,
	"last_activity_at" timestamp,
	"odoo_user_id" integer,
	"odoo_user_name" varchar,
	"spotlight_digest_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "validation_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"stage" varchar(50) NOT NULL,
	"gate_id" varchar(100),
	"completed_at" timestamp DEFAULT now(),
	"completed_by" varchar,
	"evidence" text,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "admin_categories" ADD CONSTRAINT "admin_categories_group_id_admin_category_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."admin_category_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_category_variants" ADD CONSTRAINT "admin_category_variants_category_id_admin_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."admin_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_settings" ADD CONSTRAINT "admin_settings_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_sku_mappings" ADD CONSTRAINT "admin_sku_mappings_category_id_admin_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."admin_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_cost_logs" ADD CONSTRAINT "api_cost_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bounced_emails" ADD CONSTRAINT "bounced_emails_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bounced_emails" ADD CONSTRAINT "bounced_emails_contact_id_customer_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."customer_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bounced_emails" ADD CONSTRAINT "bounced_emails_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_product_types" ADD CONSTRAINT "catalog_product_types_category_id_admin_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."admin_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_objections" ADD CONSTRAINT "category_objections_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_objections" ADD CONSTRAINT "category_objections_category_trust_id_category_trust_id_fk" FOREIGN KEY ("category_trust_id") REFERENCES "public"."category_trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_trust" ADD CONSTRAINT "category_trust_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_moments" ADD CONSTRAINT "coaching_moments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_moments" ADD CONSTRAINT "coaching_moments_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_activity_events" ADD CONSTRAINT "customer_activity_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_activity_events" ADD CONSTRAINT "customer_activity_events_product_id_product_pricing_master_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_pricing_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_coach_state" ADD CONSTRAINT "customer_coach_state_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_do_not_merge" ADD CONSTRAINT "customer_do_not_merge_customer_id_1_customers_id_fk" FOREIGN KEY ("customer_id_1") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_do_not_merge" ADD CONSTRAINT "customer_do_not_merge_customer_id_2_customers_id_fk" FOREIGN KEY ("customer_id_2") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_engagement_summary" ADD CONSTRAINT "customer_engagement_summary_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_journey" ADD CONSTRAINT "customer_journey_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_journey_instances" ADD CONSTRAINT "customer_journey_instances_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_journey_instances" ADD CONSTRAINT "customer_journey_instances_template_id_journey_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."journey_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_journey_progress" ADD CONSTRAINT "customer_journey_progress_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_journey_steps" ADD CONSTRAINT "customer_journey_steps_instance_id_customer_journey_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."customer_journey_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_machine_profiles" ADD CONSTRAINT "customer_machine_profiles_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_sync_queue" ADD CONSTRAINT "customer_sync_queue_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_user_performance" ADD CONSTRAINT "daily_user_performance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_campaign_assignments" ADD CONSTRAINT "drip_campaign_assignments_campaign_id_drip_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."drip_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_campaign_assignments" ADD CONSTRAINT "drip_campaign_assignments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_campaign_assignments" ADD CONSTRAINT "drip_campaign_assignments_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_campaign_step_status" ADD CONSTRAINT "drip_campaign_step_status_assignment_id_drip_campaign_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."drip_campaign_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_campaign_step_status" ADD CONSTRAINT "drip_campaign_step_status_step_id_drip_campaign_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."drip_campaign_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_campaign_step_status" ADD CONSTRAINT "drip_campaign_step_status_email_send_id_email_sends_id_fk" FOREIGN KEY ("email_send_id") REFERENCES "public"."email_sends"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_campaign_steps" ADD CONSTRAINT "drip_campaign_steps_campaign_id_drip_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."drip_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_campaign_steps" ADD CONSTRAINT "drip_campaign_steps_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_intelligence_blacklist" ADD CONSTRAINT "email_intelligence_blacklist_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sales_events" ADD CONSTRAINT "email_sales_events_gmail_message_id_gmail_messages_id_fk" FOREIGN KEY ("gmail_message_id") REFERENCES "public"."gmail_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sales_events" ADD CONSTRAINT "email_sales_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sales_events" ADD CONSTRAINT "email_sales_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sends" ADD CONSTRAINT "email_sends_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sends" ADD CONSTRAINT "email_sends_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sends" ADD CONSTRAINT "email_sends_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_tracking_events" ADD CONSTRAINT "email_tracking_events_token_id_email_tracking_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."email_tracking_tokens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_tracking_tokens" ADD CONSTRAINT "email_tracking_tokens_email_send_id_email_sends_id_fk" FOREIGN KEY ("email_send_id") REFERENCES "public"."email_sends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_tracking_tokens" ADD CONSTRAINT "email_tracking_tokens_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_tracking_tokens" ADD CONSTRAINT "email_tracking_tokens_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_tasks" ADD CONSTRAINT "follow_up_tasks_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_tasks" ADD CONSTRAINT "follow_up_tasks_source_event_id_customer_activity_events_id_fk" FOREIGN KEY ("source_event_id") REFERENCES "public"."customer_activity_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_deliverability_stats" ADD CONSTRAINT "gmail_deliverability_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_email_aliases" ADD CONSTRAINT "gmail_email_aliases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_email_aliases" ADD CONSTRAINT "gmail_email_aliases_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_email_aliases" ADD CONSTRAINT "gmail_email_aliases_contact_id_customer_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."customer_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_insights" ADD CONSTRAINT "gmail_insights_message_id_gmail_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."gmail_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_insights" ADD CONSTRAINT "gmail_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_insights" ADD CONSTRAINT "gmail_insights_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_message_matches" ADD CONSTRAINT "gmail_message_matches_gmail_message_id_gmail_messages_id_fk" FOREIGN KEY ("gmail_message_id") REFERENCES "public"."gmail_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_message_matches" ADD CONSTRAINT "gmail_message_matches_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_message_matches" ADD CONSTRAINT "gmail_message_matches_contact_id_customer_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."customer_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_messages" ADD CONSTRAINT "gmail_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_messages" ADD CONSTRAINT "gmail_messages_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_messages" ADD CONSTRAINT "gmail_messages_contact_id_customer_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."customer_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_sync_state" ADD CONSTRAINT "gmail_sync_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_unmatched_emails" ADD CONSTRAINT "gmail_unmatched_emails_gmail_message_id_gmail_messages_id_fk" FOREIGN KEY ("gmail_message_id") REFERENCES "public"."gmail_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_unmatched_emails" ADD CONSTRAINT "gmail_unmatched_emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_unmatched_emails" ADD CONSTRAINT "gmail_unmatched_emails_linked_customer_id_customers_id_fk" FOREIGN KEY ("linked_customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_unmatched_emails" ADD CONSTRAINT "gmail_unmatched_emails_linked_contact_id_customer_contacts_id_fk" FOREIGN KEY ("linked_contact_id") REFERENCES "public"."customer_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_template_stages" ADD CONSTRAINT "journey_template_stages_template_id_journey_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."journey_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "label_prints" ADD CONSTRAINT "label_prints_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "label_prints" ADD CONSTRAINT "label_prints_printed_by_user_id_users_id_fk" FOREIGN KEY ("printed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "label_queue" ADD CONSTRAINT "label_queue_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "label_queue" ADD CONSTRAINT "label_queue_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odoo_price_sync_queue" ADD CONSTRAINT "odoo_price_sync_queue_mapping_id_product_odoo_mappings_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."product_odoo_mappings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_scores" ADD CONSTRAINT "opportunity_scores_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_scores" ADD CONSTRAINT "opportunity_scores_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_kit_shipments" ADD CONSTRAINT "press_kit_shipments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_profiles" ADD CONSTRAINT "press_profiles_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_test_journey_details" ADD CONSTRAINT "press_test_journey_details_instance_id_customer_journey_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."customer_journey_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_test_journey_details" ADD CONSTRAINT "press_test_journey_details_product_id_product_pricing_master_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_pricing_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_test_journey_details" ADD CONSTRAINT "press_test_journey_details_sample_request_id_sample_requests_id_fk" FOREIGN KEY ("sample_request_id") REFERENCES "public"."sample_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_list_event_items" ADD CONSTRAINT "price_list_event_items_event_id_price_list_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."price_list_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_list_events" ADD CONSTRAINT "price_list_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_competitor_mappings" ADD CONSTRAINT "product_competitor_mappings_product_id_product_pricing_master_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_pricing_master"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_competitor_mappings" ADD CONSTRAINT "product_competitor_mappings_competitor_pricing_id_competitor_pricing_id_fk" FOREIGN KEY ("competitor_pricing_id") REFERENCES "public"."competitor_pricing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_exposure_log" ADD CONSTRAINT "product_exposure_log_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_exposure_log" ADD CONSTRAINT "product_exposure_log_product_id_product_pricing_master_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_pricing_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_merge_suggestions" ADD CONSTRAINT "product_merge_suggestions_local_product_id_product_pricing_master_id_fk" FOREIGN KEY ("local_product_id") REFERENCES "public"."product_pricing_master"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_pricing_master" ADD CONSTRAINT "product_pricing_master_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_type_id_product_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."product_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_types" ADD CONSTRAINT "product_types_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_category_links" ADD CONSTRAINT "quote_category_links_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_category_links" ADD CONSTRAINT "quote_category_links_quote_id_sent_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."sent_quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_events" ADD CONSTRAINT "quote_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_events" ADD CONSTRAINT "quote_events_quote_id_sent_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."sent_quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD CONSTRAINT "sample_requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD CONSTRAINT "sample_requests_product_id_product_pricing_master_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_pricing_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_shipments" ADD CONSTRAINT "sample_shipments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_shipments" ADD CONSTRAINT "sample_shipments_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_follow_up_tasks" ADD CONSTRAINT "shipment_follow_up_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_follow_up_tasks" ADD CONSTRAINT "shipment_follow_up_tasks_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_follow_up_tasks" ADD CONSTRAINT "shipment_follow_up_tasks_gmail_message_id_gmail_messages_id_fk" FOREIGN KEY ("gmail_message_id") REFERENCES "public"."gmail_messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopify_draft_orders" ADD CONSTRAINT "shopify_draft_orders_sent_quote_id_sent_quotes_id_fk" FOREIGN KEY ("sent_quote_id") REFERENCES "public"."sent_quotes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopify_orders" ADD CONSTRAINT "shopify_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopify_unmapped_items" ADD CONSTRAINT "shopify_unmapped_items_resolved_category_id_admin_categories_id_fk" FOREIGN KEY ("resolved_category_id") REFERENCES "public"."admin_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopify_unmapped_items" ADD CONSTRAINT "shopify_unmapped_items_resolved_product_type_id_catalog_product_types_id_fk" FOREIGN KEY ("resolved_product_type_id") REFERENCES "public"."catalog_product_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopify_variant_mappings" ADD CONSTRAINT "shopify_variant_mappings_product_pricing_id_product_pricing_master_id_fk" FOREIGN KEY ("product_pricing_id") REFERENCES "public"."product_pricing_master"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotlight_card_engagements" ADD CONSTRAINT "spotlight_card_engagements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotlight_card_engagements" ADD CONSTRAINT "spotlight_card_engagements_card_id_spotlight_micro_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."spotlight_micro_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotlight_customer_claims" ADD CONSTRAINT "spotlight_customer_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotlight_events" ADD CONSTRAINT "spotlight_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotlight_events" ADD CONSTRAINT "spotlight_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotlight_session_state" ADD CONSTRAINT "spotlight_session_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotlight_snoozes" ADD CONSTRAINT "spotlight_snoozes_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotlight_team_claims" ADD CONSTRAINT "spotlight_team_claims_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swatch_book_shipments" ADD CONSTRAINT "swatch_book_shipments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swatch_selections" ADD CONSTRAINT "swatch_selections_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swatch_selections" ADD CONSTRAINT "swatch_selections_swatch_id_swatches_id_fk" FOREIGN KEY ("swatch_id") REFERENCES "public"."swatches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swatch_selections" ADD CONSTRAINT "swatch_selections_shipment_id_swatch_book_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."swatch_book_shipments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swatch_selections" ADD CONSTRAINT "swatch_selections_sample_request_id_sample_requests_id_fk" FOREIGN KEY ("sample_request_id") REFERENCES "public"."sample_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swatches" ADD CONSTRAINT "swatches_product_id_product_pricing_master_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_pricing_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "territory_skip_flags" ADD CONSTRAINT "territory_skip_flags_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gmail_connections" ADD CONSTRAINT "user_gmail_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_events" ADD CONSTRAINT "validation_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_activity_logs_user_id" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_activity_logs_created_at" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "api_cost_logs_user_id_idx" ON "api_cost_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_cost_logs_api_provider_idx" ON "api_cost_logs" USING btree ("api_provider");--> statement-breakpoint
CREATE INDEX "api_cost_logs_operation_idx" ON "api_cost_logs" USING btree ("operation");--> statement-breakpoint
CREATE INDEX "api_cost_logs_created_at_idx" ON "api_cost_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_bounced_emails_email_normalized" ON "bounced_emails" USING btree ("bounced_email_normalized");--> statement-breakpoint
CREATE INDEX "IDX_bounced_emails_gmail_message_id" ON "bounced_emails" USING btree ("gmail_message_id");--> statement-breakpoint
CREATE INDEX "IDX_bounced_emails_status" ON "bounced_emails" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_bounced_emails_customer_id" ON "bounced_emails" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_bounced_emails_lead_id" ON "bounced_emails" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "coaching_moments_assigned_to_idx" ON "coaching_moments" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "coaching_moments_status_idx" ON "coaching_moments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "coaching_moments_scheduled_for_idx" ON "coaching_moments" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "coaching_moments_customer_id_idx" ON "coaching_moments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_companies_domain" ON "companies" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "IDX_customer_activity_customer_id" ON "customer_activity_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_customer_activity_event_date" ON "customer_activity_events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "IDX_customer_contacts_customer_id" ON "customer_contacts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_customer_contacts_email_normalized" ON "customer_contacts" USING btree ("email_normalized");--> statement-breakpoint
CREATE INDEX "IDX_do_not_merge_customer1" ON "customer_do_not_merge" USING btree ("customer_id_1");--> statement-breakpoint
CREATE INDEX "IDX_do_not_merge_customer2" ON "customer_do_not_merge" USING btree ("customer_id_2");--> statement-breakpoint
CREATE INDEX "IDX_sync_queue_customer_id" ON "customer_sync_queue" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_sync_queue_status" ON "customer_sync_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_sync_queue_created_at" ON "customer_sync_queue" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_customers_sales_rep_id" ON "customers" USING btree ("sales_rep_id");--> statement-breakpoint
CREATE INDEX "IDX_customers_email" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "IDX_customers_email_normalized" ON "customers" USING btree ("email_normalized");--> statement-breakpoint
CREATE INDEX "IDX_customers_company" ON "customers" USING btree ("company");--> statement-breakpoint
CREATE INDEX "IDX_customers_province" ON "customers" USING btree ("province");--> statement-breakpoint
CREATE INDEX "IDX_customers_pricing_tier" ON "customers" USING btree ("pricing_tier");--> statement-breakpoint
CREATE INDEX "IDX_customers_updated_at" ON "customers" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "IDX_customers_is_hot_prospect" ON "customers" USING btree ("is_hot_prospect");--> statement-breakpoint
CREATE INDEX "IDX_customers_is_company" ON "customers" USING btree ("is_company");--> statement-breakpoint
CREATE INDEX "IDX_customers_do_not_contact" ON "customers" USING btree ("do_not_contact");--> statement-breakpoint
CREATE INDEX "IDX_customers_odoo_partner_id" ON "customers" USING btree ("odoo_partner_id");--> statement-breakpoint
CREATE INDEX "IDX_customers_phone" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "IDX_customers_website" ON "customers" USING btree ("website");--> statement-breakpoint
CREATE INDEX "daily_performance_user_date_idx" ON "daily_user_performance" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "IDX_exclusions_odoo_partner" ON "deleted_customer_exclusions" USING btree ("odoo_partner_id");--> statement-breakpoint
CREATE INDEX "IDX_exclusions_shopify_customer" ON "deleted_customer_exclusions" USING btree ("shopify_customer_id");--> statement-breakpoint
CREATE INDEX "IDX_exclusions_email" ON "deleted_customer_exclusions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_blacklist_pattern_idx" ON "email_intelligence_blacklist" USING btree ("pattern");--> statement-breakpoint
CREATE INDEX "email_sales_events_message_idx" ON "email_sales_events" USING btree ("gmail_message_id");--> statement-breakpoint
CREATE INDEX "email_sales_events_user_idx" ON "email_sales_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_sales_events_customer_idx" ON "email_sales_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "email_sales_events_type_idx" ON "email_sales_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "email_sales_events_occurred_idx" ON "email_sales_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "IDX_email_sends_customer_id" ON "email_sends" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_email_sends_lead_id" ON "email_sends" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "IDX_email_sends_sent_at" ON "email_sends" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "IDX_email_tracking_events_token_id" ON "email_tracking_events" USING btree ("token_id");--> statement-breakpoint
CREATE INDEX "IDX_email_tracking_events_event_type" ON "email_tracking_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "IDX_email_tracking_events_created_at" ON "email_tracking_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_email_tracking_tokens_token" ON "email_tracking_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "IDX_email_tracking_tokens_customer_id" ON "email_tracking_tokens" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_email_tracking_tokens_lead_id" ON "email_tracking_tokens" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "IDX_email_tracking_tokens_email_send_id" ON "email_tracking_tokens" USING btree ("email_send_id");--> statement-breakpoint
CREATE INDEX "IDX_follow_up_tasks_customer_id" ON "follow_up_tasks" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_follow_up_tasks_due_date" ON "follow_up_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "IDX_follow_up_tasks_status" ON "follow_up_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_follow_up_tasks_assigned_to" ON "follow_up_tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "gmail_email_aliases_user_alias_idx" ON "gmail_email_aliases" USING btree ("user_id","alias_email_normalized");--> statement-breakpoint
CREATE INDEX "gmail_email_aliases_primary_idx" ON "gmail_email_aliases" USING btree ("primary_email_normalized");--> statement-breakpoint
CREATE INDEX "gmail_email_aliases_alias_idx" ON "gmail_email_aliases" USING btree ("alias_email_normalized");--> statement-breakpoint
CREATE INDEX "gmail_email_aliases_customer_idx" ON "gmail_email_aliases" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "gmail_email_aliases_user_unique" ON "gmail_email_aliases" USING btree ("user_id","alias_email_normalized");--> statement-breakpoint
CREATE INDEX "gmail_insights_user_id_idx" ON "gmail_insights" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gmail_insights_customer_id_idx" ON "gmail_insights" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "gmail_insights_status_idx" ON "gmail_insights" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gmail_insights_due_date_idx" ON "gmail_insights" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "gmail_message_matches_message_idx" ON "gmail_message_matches" USING btree ("gmail_message_id");--> statement-breakpoint
CREATE INDEX "gmail_message_matches_customer_idx" ON "gmail_message_matches" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "gmail_message_matches_email_normalized_idx" ON "gmail_message_matches" USING btree ("matched_email_normalized");--> statement-breakpoint
CREATE INDEX "gmail_messages_gmail_id_idx" ON "gmail_messages" USING btree ("gmail_message_id");--> statement-breakpoint
CREATE INDEX "gmail_messages_user_id_idx" ON "gmail_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gmail_messages_customer_id_idx" ON "gmail_messages" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "gmail_messages_from_email_normalized_idx" ON "gmail_messages" USING btree ("from_email_normalized");--> statement-breakpoint
CREATE INDEX "gmail_messages_to_email_normalized_idx" ON "gmail_messages" USING btree ("to_email_normalized");--> statement-breakpoint
CREATE INDEX "gmail_messages_user_from_normalized_idx" ON "gmail_messages" USING btree ("user_id","from_email_normalized");--> statement-breakpoint
CREATE INDEX "gmail_unmatched_email_idx" ON "gmail_unmatched_emails" USING btree ("email");--> statement-breakpoint
CREATE INDEX "gmail_unmatched_email_normalized_idx" ON "gmail_unmatched_emails" USING btree ("email_normalized");--> statement-breakpoint
CREATE INDEX "gmail_unmatched_domain_idx" ON "gmail_unmatched_emails" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "gmail_unmatched_status_idx" ON "gmail_unmatched_emails" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gmail_unmatched_user_status_idx" ON "gmail_unmatched_emails" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "label_prints_customer_idx" ON "label_prints" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "label_prints_type_idx" ON "label_prints" USING btree ("label_type");--> statement-breakpoint
CREATE INDEX "label_prints_printed_by_idx" ON "label_prints" USING btree ("printed_by_user_id");--> statement-breakpoint
CREATE INDEX "label_prints_created_at_idx" ON "label_prints" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_lead_activities_lead_id" ON "lead_activities" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "IDX_lead_activities_created_at" ON "lead_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_leads_email_normalized" ON "leads" USING btree ("email_normalized");--> statement-breakpoint
CREATE INDEX "IDX_leads_stage" ON "leads" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "IDX_leads_sales_rep" ON "leads" USING btree ("sales_rep_id");--> statement-breakpoint
CREATE INDEX "IDX_leads_odoo_lead_id" ON "leads" USING btree ("odoo_lead_id");--> statement-breakpoint
CREATE INDEX "IDX_leads_score" ON "leads" USING btree ("score");--> statement-breakpoint
CREATE INDEX "IDX_leads_created_at" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "opp_scores_customer_idx" ON "opportunity_scores" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "opp_scores_lead_idx" ON "opportunity_scores" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "opp_scores_score_idx" ON "opportunity_scores" USING btree ("score");--> statement-breakpoint
CREATE INDEX "opp_scores_type_idx" ON "opportunity_scores" USING btree ("opportunity_type");--> statement-breakpoint
CREATE INDEX "opp_scores_active_idx" ON "opportunity_scores" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "opp_scores_next_followup_idx" ON "opportunity_scores" USING btree ("next_follow_up_at");--> statement-breakpoint
CREATE INDEX "IDX_press_profiles_customer_id" ON "press_profiles" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_price_list_event_items_event_id" ON "price_list_event_items" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "IDX_price_list_event_items_item_code" ON "price_list_event_items" USING btree ("item_code");--> statement-breakpoint
CREATE INDEX "IDX_price_list_events_customer_id" ON "price_list_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_price_list_events_created_at" ON "price_list_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_product_competitor_mappings_product" ON "product_competitor_mappings" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "IDX_product_competitor_mappings_competitor" ON "product_competitor_mappings" USING btree ("competitor_pricing_id");--> statement-breakpoint
CREATE INDEX "IDX_quote_category_links_customer_id" ON "quote_category_links" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_quote_category_links_next_follow_up" ON "quote_category_links" USING btree ("next_follow_up_due");--> statement-breakpoint
CREATE INDEX "IDX_quote_events_customer_id" ON "quote_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_quote_events_created_at" ON "quote_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_sample_requests_customer_id" ON "sample_requests" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_sample_requests_created_at" ON "sample_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sample_ship_customer_idx" ON "sample_shipments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "sample_ship_lead_idx" ON "sample_shipments" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "sample_ship_status_idx" ON "sample_shipments" USING btree ("follow_up_status");--> statement-breakpoint
CREATE INDEX "sample_ship_delivery_idx" ON "sample_shipments" USING btree ("estimated_delivery_at");--> statement-breakpoint
CREATE INDEX "IDX_sent_quotes_created_at" ON "sent_quotes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_sent_quotes_customer_email" ON "sent_quotes" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "IDX_sent_quotes_follow_up_due" ON "sent_quotes" USING btree ("follow_up_due_at");--> statement-breakpoint
CREATE INDEX "IDX_sent_quotes_outcome" ON "sent_quotes" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "IDX_sent_quotes_owner" ON "sent_quotes" USING btree ("owner_email");--> statement-breakpoint
CREATE INDEX "IDX_sent_quotes_source" ON "sent_quotes" USING btree ("source");--> statement-breakpoint
CREATE INDEX "IDX_sent_quotes_shopify_draft" ON "sent_quotes" USING btree ("shopify_draft_order_id");--> statement-breakpoint
CREATE INDEX "IDX_sent_quotes_shopify_checkout" ON "sent_quotes" USING btree ("shopify_checkout_id");--> statement-breakpoint
CREATE INDEX "IDX_sent_quotes_priority" ON "sent_quotes" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "shipment_followup_user_id_idx" ON "shipment_follow_up_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shipment_followup_customer_id_idx" ON "shipment_follow_up_tasks" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "shipment_followup_status_idx" ON "shipment_follow_up_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shipment_followup_due_date_idx" ON "shipment_follow_up_tasks" USING btree ("follow_up_due_date");--> statement-breakpoint
CREATE INDEX "shipment_followup_thread_id_idx" ON "shipment_follow_up_tasks" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "spotlight_card_engagements_user_idx" ON "spotlight_card_engagements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "spotlight_card_engagements_card_idx" ON "spotlight_card_engagements" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "spotlight_card_engagements_created_at_idx" ON "spotlight_card_engagements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "spotlight_events_event_type_idx" ON "spotlight_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "spotlight_events_user_idx" ON "spotlight_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "spotlight_events_bucket_idx" ON "spotlight_events" USING btree ("bucket");--> statement-breakpoint
CREATE INDEX "spotlight_events_created_at_idx" ON "spotlight_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "spotlight_events_user_date_idx" ON "spotlight_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "spotlight_events_user_event_date_idx" ON "spotlight_events" USING btree ("user_id","event_type","created_at");--> statement-breakpoint
CREATE INDEX "spotlight_micro_cards_type_idx" ON "spotlight_micro_cards" USING btree ("card_type");--> statement-breakpoint
CREATE INDEX "spotlight_micro_cards_active_idx" ON "spotlight_micro_cards" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "spotlight_session_state_user_date_idx" ON "spotlight_session_state" USING btree ("user_id","session_date");--> statement-breakpoint
CREATE INDEX "spotlight_session_state_user_idx" ON "spotlight_session_state" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "spotlight_session_state_claimed_customer_idx" ON "spotlight_session_state" USING btree ("current_claimed_customer_id");--> statement-breakpoint
CREATE INDEX "idx_snoozes_customer" ON "spotlight_snoozes" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_snoozes_user" ON "spotlight_snoozes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_team_claims_customer" ON "spotlight_team_claims" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_swatch_book_shipments_customer_id" ON "swatch_book_shipments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "territory_skip_flags_customer_idx" ON "territory_skip_flags" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "territory_skip_flags_flagged_idx" ON "territory_skip_flags" USING btree ("flagged_for_admin_review");--> statement-breakpoint
CREATE INDEX "user_gmail_connections_user_id_idx" ON "user_gmail_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_gmail_connections_gmail_normalized_idx" ON "user_gmail_connections" USING btree ("gmail_address_normalized");