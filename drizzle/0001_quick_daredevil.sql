CREATE TABLE `policy_zone_members` (
	`zone_id` text NOT NULL,
	`jurisdiction_id` text NOT NULL,
	`source_id` text NOT NULL,
	`checked_at` text NOT NULL,
	PRIMARY KEY(`zone_id`, `jurisdiction_id`),
	FOREIGN KEY (`zone_id`) REFERENCES `policy_zones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`jurisdiction_id`) REFERENCES `jurisdictions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `official_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_policy_zone_members_jurisdiction` ON `policy_zone_members` (`jurisdiction_id`,`zone_id`);--> statement-breakpoint
CREATE TABLE `policy_zones` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`authority` text NOT NULL,
	`kind` text NOT NULL,
	`checked_at` text NOT NULL,
	`review_due_at` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_policy_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`destination_jurisdiction_id` text,
	`destination_policy_zone_id` text,
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
	FOREIGN KEY (`destination_policy_zone_id`) REFERENCES `policy_zones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`document_issuer_jurisdiction_id`) REFERENCES `jurisdictions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "check_policy_rules_one_destination" CHECK(("__new_policy_rules"."destination_jurisdiction_id" is not null) <> ("__new_policy_rules"."destination_policy_zone_id" is not null))
);
--> statement-breakpoint
INSERT INTO `__new_policy_rules`("id", "destination_jurisdiction_id", "destination_policy_zone_id", "document_issuer_jurisdiction_id", "document_type", "purpose", "border_mode", "outcome", "max_stay_days", "visa_product_name", "conditions_json", "status", "effective_from", "effective_to", "checked_at", "review_due_at", "created_at", "updated_at") SELECT "id", "destination_jurisdiction_id", NULL, "document_issuer_jurisdiction_id", "document_type", "purpose", "border_mode", "outcome", "max_stay_days", "visa_product_name", "conditions_json", "status", "effective_from", "effective_to", "checked_at", "review_due_at", "created_at", "updated_at" FROM `policy_rules`;--> statement-breakpoint
DROP TABLE `policy_rules`;--> statement-breakpoint
ALTER TABLE `__new_policy_rules` RENAME TO `policy_rules`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_policy_lookup_jurisdiction` ON `policy_rules` (`destination_jurisdiction_id`,`document_issuer_jurisdiction_id`,`document_type`,`purpose`,`status`);--> statement-breakpoint
CREATE INDEX `idx_policy_lookup_zone` ON `policy_rules` (`destination_policy_zone_id`,`document_issuer_jurisdiction_id`,`document_type`,`purpose`,`status`);--> statement-breakpoint
CREATE INDEX `idx_policy_review_due` ON `policy_rules` (`status`,`review_due_at`);
