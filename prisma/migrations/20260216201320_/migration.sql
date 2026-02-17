-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "metadataUri" TEXT,
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_verified" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Revocation" (
    "id" SERIAL NOT NULL,
    "certificateId" INTEGER NOT NULL,
    "revokedById" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tx_signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Revocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Revocation_revokedById_idx" ON "Revocation"("revokedById");

-- CreateIndex
CREATE INDEX "Revocation_revokedAt_idx" ON "Revocation"("revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Revocation_certificateId_key" ON "Revocation"("certificateId");

-- AddForeignKey
ALTER TABLE "Revocation" ADD CONSTRAINT "Revocation_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revocation" ADD CONSTRAINT "Revocation_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
