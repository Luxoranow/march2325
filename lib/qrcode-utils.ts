/**
 * Utility functions for QR code generation
 */

/**
 * Generate a QR code URL for a card
 * @param cardId The card ID
 * @param size The size of the QR code (default: 400)
 * @returns QR code URL that can be used in an <img> tag
 */
export function generateQRCodeURL(cardId: string, size: number = 400): string {
  // Use the public URL based on the deployment environment
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxora-unified.vercel.app';
  const cardUrl = `${baseUrl}/c/${cardId}`;
  
  // Use the Google Charts API to generate a QR code
  const encodedURL = encodeURIComponent(cardUrl);
  return `https://chart.googleapis.com/chart?cht=qr&chl=${encodedURL}&chs=${size}x${size}&choe=UTF-8&chld=L|0`;
}

/**
 * Generate a downloadable QR code image
 * @param cardId The card ID
 * @param cardName The name of the card (for the download filename)
 * @param size The size of the QR code (default: 1000 for high quality)
 */
export async function downloadQRCode(cardId: string, cardName: string, size: number = 1000): Promise<void> {
  const qrCodeUrl = generateQRCodeURL(cardId, size);
  
  try {
    // Fetch the QR code image
    const response = await fetch(qrCodeUrl);
    const blob = await response.blob();
    
    // Create a download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardName.replace(/\s+/g, '-').toLowerCase()}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
}

/**
 * Generate the shareable URL for a card
 * @param cardId The card ID
 * @returns The shareable URL for the card
 */
export function getCardShareableURL(cardId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxora-unified.vercel.app';
  return `${baseUrl}/c/${cardId}`;
} 