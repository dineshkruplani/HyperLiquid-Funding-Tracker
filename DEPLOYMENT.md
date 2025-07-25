# Deploying to Render

This guide will help you deploy the HyperLiquid Funding Tracker to Render's free tier.

## Prerequisites

1. A Render account (free)
2. A database (you can use Render's PostgreSQL or external database)

## Step 1: Set up Database

### Option A: Render PostgreSQL (Recommended for free tier)
1. Go to your Render dashboard
2. Click "New" → "PostgreSQL"
3. Choose "Free" plan
4. Name it `hyperliquid-funding-tracker-db`
5. Copy the connection string

### Option B: External Database
- Use any PostgreSQL database (Railway, Supabase, etc.)

## Step 2: Deploy the Application

1. **Connect your GitHub repository:**
   - Go to Render dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub account
   - Select `dineshkruplani/HyperLiquid-Funding-Tracker`

2. **Configure the service:**
   - **Name:** `hyperliquid-funding-tracker`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

3. **Set Environment Variables:**
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your database connection string
   - `PORT`: `10000` (Render's default)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

## Step 3: Database Setup

After deployment, you need to run database migrations:

1. Go to your web service in Render
2. Click on "Shell" tab
3. Run: `npx prisma migrate deploy`
4. Run: `npx prisma db seed` (if you have seed data)

## Step 4: Verify Deployment

1. Your app will be available at: `https://your-app-name.onrender.com`
2. Check the logs to ensure everything is working
3. Test the application functionality

## Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check that all dependencies are in `package.json`
   - Ensure `next.config.js` is properly configured

2. **Database connection fails:**
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from Render

3. **App crashes:**
   - Check logs in Render dashboard
   - Verify environment variables are set correctly

### Environment Variables Reference:

```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
PORT=10000
```

## Free Tier Limitations

- **Sleep after 15 minutes** of inactivity
- **512 MB RAM** limit
- **Shared CPU** resources
- **Automatic restarts** when traffic resumes

## Monitoring

- Use Render's built-in logging
- Set up health checks
- Monitor database connections
- Check for memory usage

## Updates

- Render automatically deploys when you push to `main` branch
- You can manually trigger deployments from the dashboard
- Rollback to previous versions if needed 