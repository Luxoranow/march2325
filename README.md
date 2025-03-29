# Luxora Unified

A digital business card platform built with Next.js and Supabase.

## Features

- Digital business card creation and management
- QR code generation for easy sharing
- vCard export for saving contacts to your phone
- Apple Wallet and Google Wallet integration
- Subscription management with Stripe
- Analytics tracking for card views and interactions
- Team management features
- Virtual card backgrounds (premium feature)

## Tech Stack

- Next.js 15.x
- Supabase (Authentication & Database)
- Material UI
- Stripe for payments
- TypeScript

## Environment Variables

This application requires the following environment variables:

```
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=your-deployed-site-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# For Stripe integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# For Apple Wallet Pass (optional)
APPLE_PASS_TYPE_IDENTIFIER=pass.com.yourcompany.luxora
APPLE_TEAM_IDENTIFIER=your-team-id
APPLE_PASS_PHRASE=your-pass-signing-certificate-passphrase

# For Google Wallet Pass (optional)
GOOGLE_PAY_ISSUER_ID=your-issuer-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

## Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with the required environment variables
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Execute the SQL scripts in the following order:
   - `setup_supabase.sql` - Creates base tables and functions
   - `analytics_schema.sql` - Sets up analytics tracking
   - `add_is_template_column.sql` - Updates card schema
   - `migrations/subscription_schema_update.sql` - Sets up subscription tables and logging

## Deployment

### Deploying on Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Configure environment variables in the Vercel dashboard:
   - Add all required environment variables as listed above
4. Deploy with default settings
5. Ensure you set up the webhooks for Stripe if you're using subscription features

### Deploying on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - **Name**: luxora-unified (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add the required environment variables
5. Click "Create Web Service"

## Wallet Pass Integration

To set up wallet pass integration, follow the detailed instructions in [WALLET_PASS_SETUP.md](./WALLET_PASS_SETUP.md).

## Troubleshooting

### Card Saving Issues

If you're having trouble saving cards, follow the troubleshooting steps in [CARD_SAVING_GUIDE.md](./CARD_SAVING_GUIDE.md).

### Authentication Issues

If you're having trouble with authentication:

1. Make sure you've set up authentication in your Supabase project
2. Check that you're properly signed in before trying to save cards
3. Review the browser console for detailed error messages

### Subscription Management

For subscription-related issues:

1. Check that your Stripe API keys are correct
2. Verify that your webhook endpoint is properly set up in Stripe
3. Check the subscription logs in Supabase (subscription_logs table)

## Analytics

Luxora includes detailed analytics for card views and interactions. You can access these in the dashboard, or query the database directly for more detailed analysis.

## Project Structure

- `/app` - Next.js app router components and pages
- `/components` - Reusable UI components
- `/lib` - Utility functions and helpers
- `/public` - Static files
- `/migrations` - Database migration scripts
- `/docs` - Documentation files

## License

This project is proprietary and confidential.
