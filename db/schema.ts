import { sql } from 'drizzle-orm';
import { check, index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const jurisdictions = sqliteTable('jurisdictions', {
  id: text('id').primaryKey(),
  m49Code: text('m49_code').notNull(),
  iso2: text('iso2').notNull(),
  iso3: text('iso3').notNull(),
  nameEn: text('name_en').notNull(),
  regionCode: text('region_code'),
  regionName: text('region_name'),
  subregionCode: text('subregion_code'),
  subregionName: text('subregion_name'),
  catalogSourceUrl: text('catalog_source_url').notNull(),
  catalogCheckedAt: text('catalog_checked_at').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
}, (table) => [
  uniqueIndex('idx_jurisdictions_m49').on(table.m49Code),
  uniqueIndex('idx_jurisdictions_iso2').on(table.iso2),
  uniqueIndex('idx_jurisdictions_iso3').on(table.iso3),
]);

export const officialSources = sqliteTable('official_sources', {
  id: text('id').primaryKey(),
  jurisdictionId: text('jurisdiction_id').references(() => jurisdictions.id),
  authority: text('authority').notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  sourceType: text('source_type', { enum: ['government_page', 'government_checker', 'international_system', 'official_pdf', 'official_api'] }).notNull(),
  accessModel: text('access_model', { enum: ['public', 'licensed', 'restricted'] }).notNull().default('public'),
  language: text('language').notNull().default('en'),
  status: text('status', { enum: ['discovered', 'reachable', 'verified', 'deprecated', 'blocked'] }).notNull().default('discovered'),
  checkedAt: text('checked_at'),
  nextReviewAt: text('next_review_at'),
  notes: text('notes'),
}, (table) => [
  uniqueIndex('idx_official_sources_url').on(table.url),
  index('idx_official_sources_jurisdiction_status').on(table.jurisdictionId, table.status),
]);

export const travelDocuments = sqliteTable('travel_documents', {
  id: text('id').primaryKey(),
  issuerJurisdictionId: text('issuer_jurisdiction_id').notNull().references(() => jurisdictions.id),
  documentType: text('document_type', { enum: ['ordinary_passport', 'special_passport', 'official_passport', 'diplomatic_passport', 'travel_document', 'residence_card', 'border_permit'] }).notNull(),
  label: text('label').notNull(),
  qualifier: text('qualifier'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
}, (table) => [index('idx_travel_documents_issuer_type').on(table.issuerJurisdictionId, table.documentType)]);

export const policyZones = sqliteTable('policy_zones', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  authority: text('authority').notNull(),
  kind: text('kind', { enum: ['shared_border_and_visa_area'] }).notNull(),
  checkedAt: text('checked_at').notNull(),
  reviewDueAt: text('review_due_at').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
});

export const policyZoneMembers = sqliteTable('policy_zone_members', {
  zoneId: text('zone_id').notNull().references(() => policyZones.id),
  jurisdictionId: text('jurisdiction_id').notNull().references(() => jurisdictions.id),
  sourceId: text('source_id').notNull().references(() => officialSources.id),
  checkedAt: text('checked_at').notNull(),
}, (table) => [
  primaryKey({ columns: [table.zoneId, table.jurisdictionId] }),
  index('idx_policy_zone_members_jurisdiction').on(table.jurisdictionId, table.zoneId),
]);

export const policyRules = sqliteTable('policy_rules', {
  id: text('id').primaryKey(),
  destinationJurisdictionId: text('destination_jurisdiction_id').references(() => jurisdictions.id),
  destinationPolicyZoneId: text('destination_policy_zone_id').references(() => policyZones.id),
  documentIssuerJurisdictionId: text('document_issuer_jurisdiction_id').notNull().references(() => jurisdictions.id),
  documentType: text('document_type').notNull(),
  purpose: text('purpose', { enum: ['tourism', 'business', 'study', 'work', 'family', 'transit', 'other'] }).notNull(),
  borderMode: text('border_mode', { enum: ['air', 'land', 'sea', 'any'] }).notNull().default('any'),
  outcome: text('outcome', { enum: ['visa_free', 'visa_on_arrival', 'eta_required', 'evisa_available', 'visa_required', 'prohibited', 'manual_review'] }).notNull(),
  maxStayDays: integer('max_stay_days'),
  visaProductName: text('visa_product_name'),
  conditionsJson: text('conditions_json').notNull().default('{}'),
  status: text('status', { enum: ['draft', 'verified', 'stale', 'superseded', 'rejected'] }).notNull().default('draft'),
  effectiveFrom: text('effective_from'),
  effectiveTo: text('effective_to'),
  checkedAt: text('checked_at').notNull(),
  reviewDueAt: text('review_due_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  check('check_policy_rules_one_destination', sql`(${table.destinationJurisdictionId} is not null) <> (${table.destinationPolicyZoneId} is not null)`),
  index('idx_policy_lookup_jurisdiction').on(table.destinationJurisdictionId, table.documentIssuerJurisdictionId, table.documentType, table.purpose, table.status),
  index('idx_policy_lookup_zone').on(table.destinationPolicyZoneId, table.documentIssuerJurisdictionId, table.documentType, table.purpose, table.status),
  index('idx_policy_review_due').on(table.status, table.reviewDueAt),
]);

export const ruleSources = sqliteTable('rule_sources', {
  ruleId: text('rule_id').notNull().references(() => policyRules.id),
  sourceId: text('source_id').notNull().references(() => officialSources.id),
  evidenceLocator: text('evidence_locator'),
  evidenceExcerpt: text('evidence_excerpt'),
  contentHash: text('content_hash'),
  capturedAt: text('captured_at').notNull(),
}, (table) => [primaryKey({ columns: [table.ruleId, table.sourceId] })]);

export const reviewQueue = sqliteTable('review_queue', {
  id: text('id').primaryKey(),
  jurisdictionId: text('jurisdiction_id').notNull().references(() => jurisdictions.id),
  ruleId: text('rule_id').references(() => policyRules.id),
  reason: text('reason', { enum: ['new_source', 'source_changed', 'stale', 'conflict', 'user_correction', 'unsupported_route'] }).notNull(),
  priority: integer('priority').notNull().default(50),
  state: text('state', { enum: ['open', 'in_review', 'resolved', 'dismissed'] }).notNull().default('open'),
  createdAt: text('created_at').notNull(),
  resolvedAt: text('resolved_at'),
}, (table) => [index('idx_review_queue_state_priority').on(table.state, table.priority)]);

export const ingestionRuns = sqliteTable('ingestion_runs', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').references(() => officialSources.id),
  startedAt: text('started_at').notNull(),
  finishedAt: text('finished_at'),
  status: text('status', { enum: ['running', 'succeeded', 'partial', 'failed'] }).notNull(),
  fetchedRecords: integer('fetched_records').notNull().default(0),
  acceptedRecords: integer('accepted_records').notNull().default(0),
  rejectedRecords: integer('rejected_records').notNull().default(0),
  errorSummary: text('error_summary'),
});
