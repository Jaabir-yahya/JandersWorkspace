-- CreateTable
CREATE TABLE IF NOT EXISTS "inventory_containers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "container_type" TEXT NOT NULL,
    "location" TEXT,
    "capacity" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inventory_containers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "inventory_container_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "container_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "batch_ref" TEXT NOT NULL DEFAULT '',
    "expiry_at" TIMESTAMPTZ(6),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inventory_container_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inventory_containers_tenant_id_idx" ON "inventory_containers"("tenant_id");
CREATE INDEX IF NOT EXISTS "inventory_containers_tenant_id_container_type_idx" ON "inventory_containers"("tenant_id", "container_type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "inventory_container_items_container_id_item_id_batch_ref_key" ON "inventory_container_items"("container_id", "item_id", "batch_ref");
CREATE INDEX IF NOT EXISTS "inventory_container_items_container_id_idx" ON "inventory_container_items"("container_id");
CREATE INDEX IF NOT EXISTS "inventory_container_items_item_id_idx" ON "inventory_container_items"("item_id");
CREATE INDEX IF NOT EXISTS "inventory_container_items_container_id_item_id_idx" ON "inventory_container_items"("container_id", "item_id");

-- AddForeignKey
ALTER TABLE "inventory_containers" ADD CONSTRAINT "inventory_containers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_container_items" ADD CONSTRAINT "inventory_container_items_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "inventory_containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey to items (only if items table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'items') THEN
        ALTER TABLE "inventory_container_items" ADD CONSTRAINT "inventory_container_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
