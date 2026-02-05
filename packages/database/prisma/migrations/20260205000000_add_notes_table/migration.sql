-- CreateTable
CREATE TABLE IF NOT EXISTS "notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "about_type" VARCHAR NOT NULL,
    "about_id" UUID,
    "content" TEXT,
    "context" JSONB NOT NULL DEFAULT '{}',
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "notes_tenant_id_id_about_type_key" ON "notes"("tenant_id", "id", "about_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notes_tenant_id_about_type_idx" ON "notes"("tenant_id", "about_type");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notes_tenant_id_fkey'
    ) THEN
        ALTER TABLE "notes" ADD CONSTRAINT "notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
