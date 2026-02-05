-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "business_type" TEXT NOT NULL DEFAULT 'nairobi_mboga',
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "patterns" JSONB NOT NULL DEFAULT '{}',
    "automation" JSONB NOT NULL DEFAULT '{}',
    "tier" TEXT NOT NULL DEFAULT 'BASIC',
    "country" TEXT NOT NULL DEFAULT 'KE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "api_key_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'KES',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_reasons" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parent_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "transaction_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proofs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "account_id" UUID,
    "transaction_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "file_path" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" UUID,
    "old_data" JSONB,
    "new_data" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "accounts_tenant_id_type_idx" ON "accounts"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "accounts_tenant_id_is_active_idx" ON "accounts"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_tenant_id_name_key" ON "accounts"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "transaction_reasons_tenant_id_type_idx" ON "transaction_reasons"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "transaction_reasons_tenant_id_is_active_idx" ON "transaction_reasons"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_reasons_tenant_id_name_key" ON "transaction_reasons"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "proofs_tenant_id_transaction_id_idx" ON "proofs"("tenant_id", "transaction_id");

-- CreateIndex
CREATE INDEX "proofs_tenant_id_account_id_idx" ON "proofs"("tenant_id", "account_id");

-- CreateIndex
CREATE INDEX "proofs_tenant_id_type_idx" ON "proofs"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_action_idx" ON "audit_logs"("tenant_id", "action");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_user_id_idx" ON "audit_logs"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "audit_logs_table_name_record_id_idx" ON "audit_logs"("table_name", "record_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_reasons" ADD CONSTRAINT "transaction_reasons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_reasons" ADD CONSTRAINT "transaction_reasons_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "transaction_reasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;