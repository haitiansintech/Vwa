-- AlterTable: add stripe_checkout_session_id to donations
ALTER TABLE "donations" ADD COLUMN "stripe_checkout_session_id" TEXT;

-- CreateIndex: unique constraint on stripe_checkout_session_id
CREATE UNIQUE INDEX "donations_stripe_checkout_session_id_key" ON "donations"("stripe_checkout_session_id");

-- AlterEnum: add CANCELED to DonationStatus
ALTER TYPE "DonationStatus" ADD VALUE IF NOT EXISTS 'CANCELED';
