import QRCode from 'qrcode';

export async function generateCertificateQR(nftAddress: string): Promise<string> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${nftAddress}`;
  
  try {
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    return qrDataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

export async function generateQRPDF(nftAddress: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${nftAddress}`;
}