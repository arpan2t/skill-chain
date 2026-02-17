import { prisma } from '@/lib/prisma';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { RevocationClient } from '@/lib/solana/revocation-client'; // Your client from previous part

export interface RevocationRequest {
  certificateId: number;
  reason: string;
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface RevocationResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  error?: string;
  certificate?: any;
}

export class RevocationService {
  private revocationClient: RevocationClient;
  private connection: Connection;

  constructor() {
    this.connection = new Connection(process.env.SOLANA_RPC!);
    // Initialize your revocation client
    this.revocationClient = new RevocationClient(
      this.connection,
      process.env.REGISTRY_ADDRESS!,
      this.loadAdminWallet()
    );
  }

  private loadAdminWallet(): Keypair {
    const privateKey = JSON.parse(process.env.ADMIN_PRIVATE_KEY!);
    return Keypair.fromSecretKey(new Uint8Array(privateKey));
  }

  /**
   * Revoke a certificate (both on-chain and off-chain)
   */
  async revokeCertificate(request: RevocationRequest): Promise<RevocationResponse> {
    const { certificateId, reason, adminId, ipAddress, userAgent } = request;
    
    try {
      // Start transaction
      return await prisma.$transaction(async (tx) => {
        // 1. Get certificate from database
        const certificate = await tx.certificate.findUnique({
          where: { id: certificateId },
          include: { issuer: true }
        });

        if (!certificate) {
          throw new Error('Certificate not found');
        }

        if (certificate.isRevoked) {
          throw new Error('Certificate already revoked');
        }

        // 2. Create revocation log entry
        const revocationLog = await tx.revocationLog.create({
          data: {
            certificateId: certificate.id,
            mintAddress: certificate.mintAddress,
            actionType: 'REVOKE',
            reason: reason,
            revokedById: adminId,
            metadata: {
              ipAddress,
              userAgent,
              certificateTitle: certificate.title,
              studentName: certificate.studentName
            }
          }
        });

        // 3. Add to history
        await tx.certificateRevocationHistory.create({
          data: {
            certificateId: certificate.id,
            mintAddress: certificate.mintAddress,
            eventType: 'REVOKED',
            reason: reason,
            performedById: adminId,
            metadata: {
              logId: revocationLog.id,
              ipAddress,
              userAgent
            }
          }
        });

        // 4. Update certificate status in DB
        await tx.certificate.update({
          where: { id: certificateId },
          data: {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: reason,
            revokedById: adminId
          }
        });

        // 5. Update sync status
        await tx.registrySyncStatus.upsert({
          where: { mintAddress: certificate.mintAddress },
          update: {
            offChainRevoked: true,
            needsSync: true,
            lastSyncAt: new Date()
          },
          create: {
            certificateId: certificate.id,
            mintAddress: certificate.mintAddress,
            offChainRevoked: true,
            needsSync: true
          }
        });

        // 6. Create audit trail
        await tx.revocationAuditTrail.create({
          data: {
            actionId: revocationLog.id,
            ipAddress: ipAddress || '',
            userAgent: userAgent || '',
            adminId: adminId,
            changes: {
              action: 'REVOKE',
              certificateId: certificate.id,
              mintAddress: certificate.mintAddress,
              reason: reason,
              timestamp: new Date().toISOString()
            }
          }
        });

        // 7. Perform on-chain revocation (with retry logic)
        let transactionId: string | undefined;
        let onChainSuccess = false;
        
        try {
          const result = await this.revocationClient.revokeCertificate(
            certificate.mintAddress,
            reason,
            `CERT-${certificate.id}`
          );
          
          if (result.success && result.transactionId) {
            transactionId = result.transactionId;
            onChainSuccess = true;
            
            // Update transaction ID in log
            await tx.revocationLog.update({
              where: { id: revocationLog.id },
              data: { transactionSignature: transactionId }
            });
            
            // Update sync status
            await tx.registrySyncStatus.update({
              where: { mintAddress: certificate.mintAddress },
              data: {
                onChainRevoked: true,
                needsSync: false,
                lastSyncAt: new Date()
              }
            });
          }
        } catch (onChainError) {
          console.error('On-chain revocation failed:', onChainError);
          
          // Update sync status to retry later
          await tx.registrySyncStatus.update({
            where: { mintAddress: certificate.mintAddress },
            data: {
              needsSync: true,
              syncAttempts: { increment: 1 },
              lastError: onChainError.message
            }
          });
          
          // Log the error but don't rollback - we'll retry later
          await tx.revocationLog.update({
            where: { id: revocationLog.id },
            data: {
              metadata: {
                ...revocationLog.metadata as any,
                onChainError: onChainError.message,
                onChainPending: true
              }
            }
          });
        }

        return {
          success: true,
          message: onChainSuccess 
            ? 'Certificate revoked successfully (on-chain and off-chain)'
            : 'Certificate revoked off-chain. On-chain revocation pending retry.',
          transactionId,
          certificate: {
            id: certificate.id,
            mintAddress: certificate.mintAddress,
            isRevoked: true,
            revokedAt: new Date().toISOString(),
            reason
          }
        };
      });
    } catch (error) {
      console.error('Revocation failed:', error);
      return {
        success: false,
        message: 'Revocation failed',
        error: error.message
      };
    }
  }

  /**
   * Batch revoke multiple certificates
   */
  async batchRevoke(requests: RevocationRequest[]): Promise<{
    success: number;
    failed: number;
    results: RevocationResponse[];
  }> {
    const results: RevocationResponse[] = [];
    let success = 0;
    let failed = 0;

    for (const request of requests) {
      try {
        const result = await this.revokeCertificate(request);
        results.push(result);
        if (result.success) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        results.push({
          success: false,
          message: 'Revocation failed',
          error: error.message,
          certificate: { id: request.certificateId }
        });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { success, failed, results };
  }

  /**
   * Reinstate a revoked certificate
   */
  async reinstateCertificate(
    certificateId: number,
    reason: string,
    adminId: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<RevocationResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        const certificate = await tx.certificate.findUnique({
          where: { id: certificateId }
        });

        if (!certificate) {
          throw new Error('Certificate not found');
        }

        if (!certificate.isRevoked) {
          throw new Error('Certificate is not revoked');
        }

        // Create reinstatement log
        const reinstatementLog = await tx.revocationLog.create({
          data: {
            certificateId: certificate.id,
            mintAddress: certificate.mintAddress,
            actionType: 'REINSTATE',
            reason: reason,
            revokedById: adminId,
            metadata: { ipAddress, userAgent }
          }
        });

        // Add to history
        await tx.certificateRevocationHistory.create({
          data: {
            certificateId: certificate.id,
            mintAddress: certificate.mintAddress,
            eventType: 'REINSTATED',
            reason: reason,
            performedById: adminId
          }
        });

        // Update certificate
        await tx.certificate.update({
          where: { id: certificateId },
          data: {
            isRevoked: false,
            reinstatedAt: new Date(),
            reinstatedReason: reason
          }
        });

        // Update sync status
        await tx.registrySyncStatus.update({
          where: { mintAddress: certificate.mintAddress },
          data: {
            offChainRevoked: false,
            needsSync: true,
            lastSyncAt: new Date()
          }
        });

        // Perform on-chain reinstatement
        let transactionId: string | undefined;
        try {
          const result = await this.revocationClient.reinstateCertificate(
            certificate.mintAddress,
            reason
          );
          
          if (result.success && result.transactionId) {
            transactionId = result.transactionId;
            
            await tx.revocationLog.update({
              where: { id: reinstatementLog.id },
              data: { transactionSignature: transactionId }
            });
            
            await tx.registrySyncStatus.update({
              where: { mintAddress: certificate.mintAddress },
              data: {
                onChainRevoked: false,
                needsSync: false,
                lastSyncAt: new Date()
              }
            });
          }
        } catch (onChainError) {
          console.error('On-chain reinstatement failed:', onChainError);
          await tx.registrySyncStatus.update({
            where: { mintAddress: certificate.mintAddress },
            data: {
              needsSync: true,
              syncAttempts: { increment: 1 },
              lastError: onChainError.message
            }
          });
        }

        return {
          success: true,
          message: 'Certificate reinstated successfully',
          transactionId,
          certificate: {
            id: certificate.id,
            mintAddress: certificate.mintAddress,
            isRevoked: false,
            reinstatedAt: new Date().toISOString()
          }
        };
      });
    } catch (error) {
      return {
        success: false,
        message: 'Reinstatement failed',
        error: error.message
      };
    }
  }

  /**
   * Get revocation history for a certificate
   */
  async getCertificateRevocationHistory(certificateId: number) {
    const history = await prisma.certificateRevocationHistory.findMany({
      where: { certificateId },
      orderBy: { createdAt: 'desc' },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return history;
  }

  /**
   * Get all revocation logs with filters
   */
  async getRevocationLogs(filters: {
    startDate?: Date;
    endDate?: Date;
    adminId?: number;
    actionType?: 'REVOKE' | 'REINSTATE';
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (fields.endDate) where.createdAt.lte = fields.endDate;
    }

    if (filters.adminId) {
      where.revokedById = filters.adminId;
    }

    if (filters.actionType) {
      where.actionType = filters.actionType;
    }

    const logs = await prisma.revocationLog.findMany({
      where,
      take: filters.limit || 50,
      skip: filters.offset || 0,
      orderBy: { createdAt: 'desc' },
      include: {
        certificate: {
          select: {
            id: true,
            title: true,
            studentName: true,
            mintAddress: true
          }
        },
        revokedBy: {
          select: { id: true, name: true, email: true }
        },
        auditTrail: true
      }
    });

    const total = await prisma.revocationLog.count({ where });

    return { logs, total };
  }

  /**
   * Sync off-chain revocations with on-chain registry
   */
  async syncWithOnChainRegistry() {
    const pendingSyncs = await prisma.registrySyncStatus.findMany({
      where: { needsSync: true },
      include: { certificate: true }
    });

    const results = [];

    for (const sync of pendingSyncs) {
      try {
        // Check current on-chain status
        const onChainStatus = await this.revocationClient.checkRevocationStatus(
          sync.mintAddress
        );

        if (sync.offChainRevoked !== onChainStatus.revoked) {
          // Inconsistency detected
          if (sync.offChainRevoked && !onChainStatus.revoked) {
            // Need to revoke on-chain
            await this.revocationClient.revokeCertificate(
              sync.mintAddress,
              sync.certificate?.revokedReason || 'Sync revocation',
              `CERT-${sync.certificateId}`
            );
          } else if (!sync.offChainRevoked && onChainStatus.revoked) {
            // Need to reinstate on-chain
            await this.revocationClient.reinstateCertificate(
              sync.mintAddress,
              'Sync reinstatement'
            );
          }
        }

        // Update sync status
        await prisma.registrySyncStatus.update({
          where: { id: sync.id },
          data: {
            onChainRevoked: onChainStatus.revoked,
            needsSync: false,
            lastSyncAt: new Date(),
            syncAttempts: 0,
            lastError: null
          }
        });

        results.push({
          mintAddress: sync.mintAddress,
          success: true,
          syncedAt: new Date()
        });
      } catch (error) {
        await prisma.registrySyncStatus.update({
          where: { id: sync.id },
          data: {
            syncAttempts: { increment: 1 },
            lastError: error.message
          }
        });

        results.push({
          mintAddress: sync.mintAddress,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Generate revocation report for auditing
   */
  async generateRevocationReport(startDate: Date, endDate: Date) {
    const revocations = await prisma.revocationLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        actionType: 'REVOKE'
      },
      include: {
        certificate: true,
        revokedBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const reinstatements = await prisma.revocationLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        actionType: 'REINSTATE'
      },
      include: {
        certificate: true,
        revokedBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      totalRevocations: revocations.length,
      totalReinstatements: reinstatements.length,
      uniqueAdmins: [...new Set(revocations.map(r => r.revokedById))].length,
      mostActiveAdmin: this.getMostActiveAdmin([...revocations, ...reinstatements]),
      dailyBreakdown: this.getDailyBreakdown([...revocations, ...reinstatements], startDate, endDate)
    };

    return {
      period: { startDate, endDate },
      stats,
      revocations,
      reinstatements,
      generatedAt: new Date()
    };
  }

  private getMostActiveAdmin(logs: any[]) {
    const adminCounts = logs.reduce((acc, log) => {
      acc[log.revokedById] = (acc[log.revokedById] || 0) + 1;
      return acc;
    }, {});

    const mostActiveId = Object.entries(adminCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0];
    
    if (mostActiveId) {
      const admin = logs.find(l => l.revokedById === parseInt(mostActiveId))?.revokedBy;
      return {
        adminId: mostActiveId,
        name: admin?.name,
        count: adminCounts[mostActiveId]
      };
    }

    return null;
  }

  private getDailyBreakdown(logs: any[], startDate: Date, endDate: Date) {
    const breakdown = {};
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      breakdown[dateStr] = {
        revocations: 0,
        reinstatements: 0,
        total: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    logs.forEach(log => {
      const dateStr = new Date(log.createdAt).toISOString().split('T')[0];
      if (breakdown[dateStr]) {
        if (log.actionType === 'REVOKE') {
          breakdown[dateStr].revocations++;
        } else {
          breakdown[dateStr].reinstatements++;
        }
        breakdown[dateStr].total++;
      }
    });

    return breakdown;
  }
}