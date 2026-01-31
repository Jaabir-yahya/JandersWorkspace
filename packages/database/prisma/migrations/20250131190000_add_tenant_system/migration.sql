-- CreateTable: Tenant
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Tenant slug
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex: Tenant country
CREATE INDEX "tenants_country_idx" ON "tenants"("country");

-- CreateTable: TenantIntegration
CREATE TABLE "tenant_integrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "integration_type" TEXT NOT NULL,
    "encrypted_config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync_at" TIMESTAMPTZ(6),
    "sync_status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: TenantIntegration unique
CREATE UNIQUE INDEX "tenant_integrations_tenant_id_integration_type_key" ON "tenant_integrations"("tenant_id", "integration_type");

-- CreateIndex: TenantIntegration tenant_id
CREATE INDEX "tenant_integrations_tenant_id_idx" ON "tenant_integrations"("tenant_id");

-- CreateIndex: TenantIntegration integration_type
CREATE INDEX "tenant_integrations_integration_type_idx" ON "tenant_integrations"("integration_type");

-- AddForeignKey: TenantIntegration -> Tenant
ALTER TABLE "tenant_integrations" ADD CONSTRAINT "tenant_integrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: FeatureFlag
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tiers" TEXT[],
    "countries" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: FeatureFlag name
CREATE UNIQUE INDEX "feature_flags_name_key" ON "feature_flags"("name");

-- CreateIndex: FeatureFlag name
CREATE INDEX "feature_flags_name_idx" ON "feature_flags"("name");

-- CreateIndex: FeatureFlag is_active
CREATE INDEX "feature_flags_is_active_idx" ON "feature_flags"("is_active");

-- CreateTable: WebhookEvent
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "integration_type" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: WebhookEvent tenant_id + processed
CREATE INDEX "webhook_events_tenant_id_processed_idx" ON "webhook_events"("tenant_id", "processed");

-- CreateIndex: WebhookEvent created_at
CREATE INDEX "webhook_events_created_at_idx" ON "webhook_events"("created_at");

-- CreateIndex: WebhookEvent processed
CREATE INDEX "webhook_events_processed_idx" ON "webhook_events"("processed");

-- AddForeignKey: WebhookEvent -> Tenant
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ExternalReference
CREATE TABLE "external_references" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "local_id" TEXT NOT NULL,
    "local_type" TEXT NOT NULL,
    "external_system" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "external_data" JSONB NOT NULL,
    "sync_direction" TEXT NOT NULL,
    "last_sync_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ExternalReference unique
CREATE UNIQUE INDEX "external_references_tenant_id_local_id_local_type_externa_key" ON "external_references"("tenant_id", "local_id", "local_type", "external_system");

-- CreateIndex: ExternalReference tenant_id
CREATE INDEX "external_references_tenant_id_idx" ON "external_references"("tenant_id");

-- CreateIndex: ExternalReference external_system
CREATE INDEX "external_references_external_system_idx" ON "external_references"("external_system");

-- CreateIndex: ExternalReference external_id
CREATE INDEX "external_references_external_id_idx" ON "external_references"("external_id");

-- CreateIndex: ExternalReference local_type
CREATE INDEX "external_references_local_type_idx" ON "external_references"("local_type");

-- AddForeignKey: ExternalReference -> Tenant
ALTER TABLE "external_references" ADD CONSTRAINT "external_references_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: User -> Tenant
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Entity -> Tenant
ALTER TABLE "entities" ADD CONSTRAINT "entities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Transaction -> Tenant
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Payment -> Tenant
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
