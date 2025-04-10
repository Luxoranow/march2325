/**
 * Wallet Pass Utilities for Luxora
 * Handles generation of Apple Wallet and Google Wallet passes
 */

import path from 'path';
import fs from 'fs';
import * as PassKit from 'passkit-generator';
import { GoogleAuth } from 'google-auth-library';
import type { JWTInput } from 'google-auth-library';

// Types
export interface PassData {
  id: string;            // Card ID
  name: string;          // Name on card
  title?: string;        // Job title
  companyName?: string;  // Company name
  email?: string;        // Email address
  phone?: string;        // Phone number
  website?: string;      // Website
  logoUrl?: string;      // URL to the logo image
  photoUrl?: string;     // URL to the photo
  themeColor?: string;   // Primary theme color
}

/**
 * Generate an Apple Wallet pass
 * @param passData The data for the pass
 * @returns Buffer containing the .pkpass file
 */
export async function generateAppleWalletPass(passData: PassData): Promise<Buffer> {
  // In a production environment, you would store these securely
  // For development, you can keep them in a secure directory
  const PASS_TYPE_IDENTIFIER = process.env.APPLE_PASS_TYPE_IDENTIFIER || '';
  const TEAM_IDENTIFIER = process.env.APPLE_TEAM_IDENTIFIER || '';
  
  // We will need to create these certificate files after obtaining them from Apple
  const certDirectory = path.resolve(process.cwd(), 'certificates');
  
  // Check if certificates directory exists
  if (!fs.existsSync(certDirectory)) {
    console.warn('Certificates directory not found. Using mock implementation for Apple Wallet pass.');
    // Return a mock implementation for environments without certificates
    return createMockAppleWalletPass(passData);
  }
  
  try {
    // Check if all required certificate files exist
    const requiredFiles = ['model', 'wwdr.pem', 'signerCert.pem', 'signerKey.pem'];
    for (const file of requiredFiles) {
      const filePath = path.resolve(certDirectory, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`Required certificate file ${file} not found. Using mock implementation.`);
        return createMockAppleWalletPass(passData);
      }
    }
    
    // Create the pass
    const pass = await PassKit.PKPass.from({
      model: path.resolve(certDirectory, 'model'),
      certificates: {
        wwdr: fs.readFileSync(path.resolve(certDirectory, 'wwdr.pem')),
        signerCert: fs.readFileSync(path.resolve(certDirectory, 'signerCert.pem')),
        signerKey: {
          keyFile: path.resolve(certDirectory, 'signerKey.pem'),
          passphrase: process.env.APPLE_PASS_PHRASE || ''
        }
      },
      overrides: {
        // Pass metadata
        serialNumber: passData.id,
        passTypeIdentifier: PASS_TYPE_IDENTIFIER,
        teamIdentifier: TEAM_IDENTIFIER,
        organizationName: 'Luxora',
        description: `${passData.name}'s Digital Business Card`,
        
        // Visual appearance
        logoText: passData.companyName || 'Luxora',
        foregroundColor: 'rgb(255, 255, 255)',
        backgroundColor: passData.themeColor || 'rgb(0, 0, 0)',
        
        // Pass structure - generic type used for business cards
        generic: {
          primaryFields: [
            {
              key: 'name',
              label: 'NAME',
              value: passData.name
            }
          ],
          secondaryFields: [
            {
              key: 'title',
              label: 'TITLE',
              value: passData.title || ''
            },
            {
              key: 'company',
              label: 'COMPANY',
              value: passData.companyName || ''
            }
          ],
          auxiliaryFields: [
            {
              key: 'email',
              label: 'EMAIL',
              value: passData.email || ''
            },
            {
              key: 'phone',
              label: 'PHONE',
              value: passData.phone || ''
            }
          ],
          backFields: [
            {
              key: 'website',
              label: 'WEBSITE',
              value: passData.website || ''
            },
            {
              key: 'created-with',
              label: 'CREATED WITH',
              value: 'Luxora Digital Business Cards'
            }
          ]
        }
      }
    });
    
    // Add logo and profile photo if available
    if (passData.logoUrl) {
      // You would need to fetch and process these images
      // For implementation simplicity, this is a placeholder
      // pass.addBuffer('logo.png', logoImageBuffer);
    }
    
    if (passData.photoUrl) {
      // pass.addBuffer('thumbnail.png', photoImageBuffer);
    }
    
    // Generate the pass file
    const passBuffer = pass.getAsBuffer();
    return passBuffer;
  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error);
    return createMockAppleWalletPass(passData);
  }
}

/**
 * Creates a mock Apple Wallet pass for environments where certificates aren't available
 * @param passData The data for the pass
 * @returns A buffer with mock data
 */
function createMockAppleWalletPass(passData: PassData): Buffer {
  // Create a simple JSON representation of what the pass would contain
  const mockPassData = {
    type: 'apple-wallet-pass',
    format: 'mock',
    message: 'This is a mock Apple Wallet pass. Real pass generation requires proper certificates.',
    passData: {
      name: passData.name,
      title: passData.title,
      company: passData.companyName,
      email: passData.email,
      phone: passData.phone,
      website: passData.website
    }
  };
  
  // Return as a buffer
  return Buffer.from(JSON.stringify(mockPassData, null, 2));
}

/**
 * Generate a Google Wallet pass JWT
 * @param passData The data for the pass
 * @returns JWT string for Google Wallet
 */
export async function generateGoogleWalletPass(passData: PassData): Promise<string> {
  try {
    // Google Pay API for Passes constants
    const GOOGLE_PAY_ISSUER_ID = process.env.GOOGLE_PAY_ISSUER_ID || '';
    const GOOGLE_PAY_CLASS_ID = `${GOOGLE_PAY_ISSUER_ID}.luxora_business_card_${passData.id}`;
    const GOOGLE_PAY_OBJECT_ID = `${GOOGLE_PAY_ISSUER_ID}.luxora_card_object_${passData.id}`;
    
    // Create class (template) for the business card
    const genericClass = {
      id: GOOGLE_PAY_CLASS_ID,
      classTemplateInfo: {
        cardRowTemplateOverride: {
          cardRowTemplateInfos: [
            {
              twoItems: {
                startItem: {
                  firstValue: {
                    fields: [
                      {
                        fieldPath: 'object.textModulesData["name"]'
                      }
                    ]
                  }
                },
                endItem: {
                  firstValue: {
                    fields: [
                      {
                        fieldPath: 'object.textModulesData["title"]'
                      }
                    ]
                  }
                }
              }
            },
            {
              twoItems: {
                startItem: {
                  firstValue: {
                    fields: [
                      {
                        fieldPath: 'object.textModulesData["email"]'
                      }
                    ]
                  }
                },
                endItem: {
                  firstValue: {
                    fields: [
                      {
                        fieldPath: 'object.textModulesData["phone"]'
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    };
    
    // Create object (instance) for the specific business card
    const genericObject = {
      id: GOOGLE_PAY_OBJECT_ID,
      classId: GOOGLE_PAY_CLASS_ID,
      textModulesData: [
        {
          id: 'name',
          header: 'NAME',
          body: passData.name
        },
        {
          id: 'title',
          header: 'TITLE',
          body: passData.title || ''
        },
        {
          id: 'company',
          header: 'COMPANY',
          body: passData.companyName || ''
        },
        {
          id: 'email',
          header: 'EMAIL',
          body: passData.email || ''
        },
        {
          id: 'phone',
          header: 'PHONE',
          body: passData.phone || ''
        },
        {
          id: 'website',
          header: 'WEBSITE',
          body: passData.website || ''
        }
      ],
      // Logo and images would be added here with imageModulesData
      // For implementation simplicity, this is a placeholder
    };
    
    // In a real implementation, you would create a JWT with the genericObject
    // and sign it with your service account credentials
    
    // This is a placeholder for the actual JWT creation
    // const credentials = require('./path-to-service-account.json');
    // const auth = new GoogleAuth({
    //   credentials: credentials,
    //   scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
    // });
    
    // const client = await auth.getClient();
    // const jwtPayload = {
    //   iss: client.email,
    //   aud: 'google',
    //   typ: 'savetowallet',
    //   iat: Math.floor(Date.now() / 1000),
    //   payload: {
    //     genericObjects: [genericObject]
    //   }
    // };
    
    // Placeholder - in actual implementation, you would generate a real JWT
    const jwtPlaceholder = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify({
      iss: 'service-account@luxora-wallet-pass.iam.gserviceaccount.com',
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      payload: {
        genericObjects: [genericObject]
      }
    })).toString('base64')}.signature`;
    
    return jwtPlaceholder;
  } catch (error) {
    console.error('Error generating Google Wallet pass:', error);
    throw new Error('Failed to generate Google Wallet pass');
  }
}

/**
 * Detect the wallet type based on the user agent string
 * @param userAgent The User-Agent header string from the request
 * @returns 'apple' for iOS devices, 'google' for Android devices, 'unknown' for others
 */
export function detectWalletType(userAgent: string): 'apple' | 'google' | 'unknown' {
  const lowerCaseUA = userAgent.toLowerCase();
  
  // Check for iOS devices
  if (lowerCaseUA.includes('iphone') || lowerCaseUA.includes('ipad') || lowerCaseUA.includes('ipod') || lowerCaseUA.includes('mac os')) {
    return 'apple';
  }
  
  // Check for Android devices
  if (lowerCaseUA.includes('android')) {
    return 'google';
  }
  
  // Default to unknown for other devices
  return 'unknown';
} 