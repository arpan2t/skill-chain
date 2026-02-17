-- CreateTable
CREATE TABLE "RevocationRequest" (
    "id" SERIAL NOT NULL,
    "certificateId" INTEGER NOT NULL,
    "requestedById" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevocationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RevocationRequest_certificateId_idx" ON "RevocationRequest"("certificateId");

-- CreateIndex
CREATE INDEX "RevocationRequest_requestedById_idx" ON "RevocationRequest"("requestedById");

-- AddForeignKey
ALTER TABLE "RevocationRequest" ADD CONSTRAINT "RevocationRequest_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevocationRequest" ADD CONSTRAINT "RevocationRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
