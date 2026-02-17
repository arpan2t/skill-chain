import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface Certificate {
  nftAddress: string;
  name: string;
  description: string;
  image: string;
  attributes: any[];
  issuer: string;
  issuedAt: string;
  revoked: boolean;
  metadataUri: string;
}

export function useUserCertificates() {
  const { publicKey, connected } = useWallet();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) {
      setCertificates([]);
      return;
    }

    const fetchCertificates = async () => {
      setLoading(true);
      setError(null);
      
      try {
       const response = await fetch("/api/user/certificates", {
            'method': "POST",
            'headers': {
                        "Content-Type": "application/json",
                    },
            'body': JSON.stringify({
                wallet: publicKey.toString()
            })
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch certificates");
        }
        
        const data = await response.json();
        setCertificates(data.data || []);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [publicKey, connected]);

  const refresh = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/certificates?wallet=${publicKey.toString()}&refresh=true`
      );
      const data = await response.json();
      setCertificates(data.data || []);
    } catch (err) {
      console.error("Error refreshing:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    certificates,
    loading,
    error,
    refresh,
    hasCertificates: certificates.length > 0
  };
}