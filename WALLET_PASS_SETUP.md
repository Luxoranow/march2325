# Wallet Pass Integration Setup Guide

This guide provides detailed instructions for setting up the wallet pass integration for Luxora, enabling users to add their business cards to Apple Wallet and Google Wallet.

## Prerequisites

- Apple Developer Account (for Apple Wallet)
- Google Cloud Platform Account (for Google Wallet)
- Node.js v20+ and npm

## Installation

1. Install the required packages:
   ```bash
   npm install passkit-generator google-auth-library jwt-simple
   ```

## Apple Wallet Setup

### 1. Create a Pass Type ID

1. Go to your [Apple Developer Account](https://developer.apple.com/account)
2. Navigate to "Certificates, Identifiers & Profiles" > "Identifiers"
3. Click "+" to add a new identifier
4. Select "Pass Type ID" and click "Continue"
5. Enter a description (e.g., "Luxora Business Cards")
6. Enter a unique identifier (e.g., "pass.com.yourcompany.luxora")
7. Click "Register"

### 2. Create Certificates

1. In your Apple Developer account, go to "Certificates, Identifiers & Profiles" > "Certificates"
2. Click "+" to add a new certificate
3. Under "Services", select "Pass Type ID Certificate" and click "Continue"
4. Select your Pass Type ID and click "Continue"
5. Follow the instructions to create a Certificate Signing Request (CSR) using Keychain Access
6. Upload the CSR and click "Continue"
7. Download the certificate (.cer file)

### 3. Convert Certificates

1. Double-click the downloaded .cer file to add it to Keychain Access
2. In Keychain Access, locate the certificate under "My Certificates"
3. Right-click on the certificate (it should include your private key) and select "Export"
4. Export it as a .p12 file and set a password
5. Create a `certificates` directory in your project root
6. Convert the certificates to .pem format:

   ```bash
   # Convert your certificate
   openssl pkcs12 -in path/to/your/certificate.p12 -out certificates/signerCert.pem -clcerts -nokeys
   
   # Convert your private key
   openssl pkcs12 -in path/to/your/certificate.p12 -out certificates/signerKey.pem -nocerts -nodes
   
   # Download and convert the Apple WWDR certificate
   curl https://developer.apple.com/certificationauthority/AppleWWDRCA.cer -o AppleWWDRCA.cer
   openssl x509 -inform der -in AppleWWDRCA.cer -out certificates/wwdr.pem
   ```

### 4. Create Pass Template

1. Create a `certificates/model` directory in your project
2. Add the required template files:
   - `pass.json`: Defines the structure and appearance of your pass
   - `logo.png`: Your app logo (required)
   - `icon.png`: Icon for the pass
   - Optional: `thumbnail.png`, `background.png`, etc.

Example `pass.json`:
```json
{
  "formatVersion": 1,
  "passTypeIdentifier": "pass.com.yourcompany.luxora",
  "teamIdentifier": "ABCDE12345",
  "organizationName": "Luxora",
  "description": "Luxora Digital Business Card",
  "logoText": "Luxora",
  "foregroundColor": "rgb(255, 255, 255)",
  "backgroundColor": "rgb(0, 0, 0)",
  "labelColor": "rgb(255, 255, 255)",
  "generic": {}
}
```

## Google Wallet Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the Google Wallet API

### 2. Create Service Account

1. In your Google Cloud Project, navigate to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter a name and description for the service account
4. Grant the service account the "Google Wallet API Service Agent" role
5. Click "Create and Continue", then "Done"
6. Click on the service account you just created
7. Go to the "Keys" tab
8. Click "Add Key" > "Create new key"
9. Select "JSON" format and click "Create"
10. Save the downloaded JSON key file in a secure location

### 3. Google Pay API for Passes Setup

1. Go to the [Google Pay and Wallet Console](https://pay.google.com/business/console)
2. Click "Passes API" > "Get Started"
3. Complete the onboarding process
4. Note your Issuer ID for later use

## Environment Configuration

Update your `.env.local` file with the following values:

```
# Apple Wallet Pass Configuration
APPLE_PASS_TYPE_IDENTIFIER=pass.com.yourcompany.luxora
APPLE_TEAM_IDENTIFIER=ABCDE12345
APPLE_PASS_PHRASE=your-certificate-passphrase

# Google Wallet Pass Configuration
GOOGLE_PAY_ISSUER_ID=your-issuer-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

## Testing

1. For Apple Wallet testing:
   - Use a real iOS device (simulator doesn't support Wallet)
   - Ensure the device has the Wallet app installed

2. For Google Wallet testing:
   - Use a real Android device with Google Wallet installed
   - Log in with a Google account

## Troubleshooting

- **Apple Wallet Pass Not Adding**: Check that your certificates are properly configured and your pass is properly signed.
- **Google Wallet Pass Not Showing**: Verify your service account has the correct permissions and that your JWT is properly signed.
- **"Invalid Pass" Error**: Ensure your pass structure conforms to Apple's requirements and all required fields are present.

## Resources

- [Apple Wallet Developer Guide](https://developer.apple.com/documentation/walletpasses)
- [Google Wallet Developer Guide](https://developers.google.com/pay/passes) 