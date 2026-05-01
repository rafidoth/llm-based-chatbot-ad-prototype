-- Hotfix for environments with non-baselined Prisma migrations.
-- Keeps runtime schema aligned with generated Prisma client.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "adTargetingMode" TEXT NOT NULL DEFAULT 'turn';
ALTER TABLE "User" DROP COLUMN IF EXISTS "adCardVariants";
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "right_ad_panel" BOOLEAN NOT NULL DEFAULT false;
