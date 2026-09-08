CREATE TABLE `ingestion_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text,
	`started_at` text NOT NULL,
	`finished_at` text,
	`status` text NOT NULL,
	`fetched_records` integer DEFAULT 0 NOT NULL,
	`accepted_records` integer DEFAULT 0 NOT NULL,
	`rejected_records` integer DEFAULT 0 NOT NULL,
	`error_summary` text,
	FOREIGN KEY (`source_id`) REFERENCES `official_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jurisdictions` (
	`id` text PRIMARY KEY NOT NULL,
	`m49_code` text NOT NULL,
	`iso2` text NOT NULL,
	`iso3` text NOT NULL,
	`name_en` text NOT NULL,
	`region_code` text,
	`region_name` text,
	`subregion_code` text,
	`subregion_name` text,
	`catalog_source_url` text NOT NULL,
	`catalog_checked_at` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_jurisdictions_m49` ON `jurisdictions` (`m49_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_jurisdictions_iso2` ON `jurisdictions` (`iso2`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_jurisdictions_iso3` ON `jurisdictions` (`iso3`);--> statement-breakpoint
CREATE TABLE `official_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`jurisdiction_id` text,
	`authority` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`source_type` text NOT NULL,
	`access_model` text DEFAULT 'public' NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`status` text DEFAULT 'discovered' NOT NULL,
	`checked_at` text,
	`next_review_at` text,
	`notes` text,
	FOREIGN KEY (`jurisdiction_id`) REFERENCES `jurisdictions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_official_sources_url` ON `official_sources` (`url`);--> statement-breakpoint
CREATE INDEX `idx_official_sources_jurisdiction_status` ON `official_sources` (`jurisdiction_id`,`status`);--> statement-breakpoint
CREATE TABLE `policy_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`destination_jurisdiction_id` text NOT NULL,
	`document_issuer_jurisdiction_id` text NOT NULL,
	`document_type` text NOT NULL,
	`purpose` text NOT NULL,
	`border_mode` text DEFAULT 'any' NOT NULL,
	`outcome` text NOT NULL,
	`max_stay_days` integer,
	`visa_product_name` text,
	`conditions_json` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`effective_from` text,
	`effective_to` text,
	`checked_at` text NOT NULL,
	`review_due_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`destination_jurisdiction_id`) REFERENCES `jurisdictions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`document_issuer_jurisdiction_id`) REFERENCES `jurisdictions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_policy_lookup` ON `policy_rules` (`destination_jurisdiction_id`,`document_issuer_jurisdiction_id`,`document_type`,`purpose`,`status`);--> statement-breakpoint
CREATE INDEX `idx_policy_review_due` ON `policy_rules` (`status`,`review_due_at`);--> statement-breakpoint
CREATE TABLE `review_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`jurisdiction_id` text NOT NULL,
	`rule_id` text,
	`reason` text NOT NULL,
	`priority` integer DEFAULT 50 NOT NULL,
	`state` text DEFAULT 'open' NOT NULL,
	`created_at` text NOT NULL,
	`resolved_at` text,
	FOREIGN KEY (`jurisdiction_id`) REFERENCES `jurisdictions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rule_id`) REFERENCES `policy_rules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_review_queue_state_priority` ON `review_queue` (`state`,`priority`);--> statement-breakpoint
CREATE TABLE `rule_sources` (
	`rule_id` text NOT NULL,
	`source_id` text NOT NULL,
	`evidence_locator` text,
	`evidence_excerpt` text,
	`content_hash` text,
	`captured_at` text NOT NULL,
	PRIMARY KEY(`rule_id`, `source_id`),
	FOREIGN KEY (`rule_id`) REFERENCES `policy_rules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `official_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `travel_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`issuer_jurisdiction_id` text NOT NULL,
	`document_type` text NOT NULL,
	`label` text NOT NULL,
	`qualifier` text,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`issuer_jurisdiction_id`) REFERENCES `jurisdictions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_travel_documents_issuer_type` ON `travel_documents` (`issuer_jurisdiction_id`,`document_type`);