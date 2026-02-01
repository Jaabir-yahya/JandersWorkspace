-- AlterTable
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "api_key_hash" VARCHAR(64);
