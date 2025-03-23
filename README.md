# Luxora Unified

A digital business card platform built with Next.js and Supabase.

## Features

- Digital business card creation and management
- QR code generation for easy sharing
- Analytics tracking for card views and interactions
- Team management features
- Subscription management

## Tech Stack

- Next.js 15.x
- Supabase (Authentication & Database)
- Material UI
- TypeScript

## Environment Variables

This application requires the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=your-deployed-site-url
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

## Deployment on Render

### Manual Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - **Name**: luxora-unified (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add the required environment variables
5. Click "Create Web Service"

### Auto-Deployment

Any pushes to the main branch will automatically trigger a new deployment if you've connected your GitHub repository to Render.

## Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and sign in or create an account
2. Create a new project
3. Once your project is created, go to the SQL Editor
4. Copy the contents of `setup_supabase.sql` from this project and run it in the SQL Editor
5. This will create the necessary tables and permissions for the app to work

### 2. Environment Variables

1. Make sure your `.env.local` file has the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Replace the values with your actual Supabase URL and anon key

### 3. Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Troubleshooting

### Card Saving Issues

If you're having trouble saving cards, check the following:

1. Make sure you've run the SQL setup script in your Supabase project
2. Check that your environment variables are correctly set
3. Look at the browser console for detailed error messages
4. Verify that the Row Level Security (RLS) policies are correctly set up in Supabase

### Authentication Issues

If you're having trouble with authentication:

1. Make sure you've set up authentication in your Supabase project
2. Check that you're properly signed in before trying to save cards
3. For testing, the app uses a default test user ID: `00000000-0000-0000-0000-000000000000`

## Features

- Create and edit digital business cards
- Customize with different themes
- Add social media links
- Add messaging platform contacts
- Create custom call-to-action buttons
- Generate QR codes for your cards
- Share via email or text message
