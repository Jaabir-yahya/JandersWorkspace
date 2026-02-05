-- Add assigned_entity_id to inventory_containers (link container to person/entity)
ALTER TABLE "inventory_containers" ADD COLUMN IF NOT EXISTS "assigned_entity_id" UUID;

CREATE INDEX IF NOT EXISTS "inventory_containers_assigned_entity_id_idx" ON "inventory_containers"("assigned_entity_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inventory_containers_assigned_entity_id_fkey'
  ) THEN
    ALTER TABLE "inventory_containers" ADD CONSTRAINT "inventory_containers_assigned_entity_id_fkey"
      FOREIGN KEY ("assigned_entity_id") REFERENCES "entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
