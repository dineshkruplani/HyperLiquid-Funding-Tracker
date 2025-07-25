# Quick Setup Guide

## ✅ Server Status
The Next.js server is running successfully on http://localhost:3000

## 🗄️ Database Setup Required

The application needs a PostgreSQL database to function fully. Here are your options:

### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL (if not already installed)
brew install postgresql
brew services start postgresql

# Create database
createdb hyperliquid_funding_tracker

# Set up environment
cp env.example .env.local
# Edit .env.local and add: DATABASE_URL="postgresql://username:password@localhost:5432/hyperliquid_funding_tracker"

# Run migrations
npm run db:migrate
```

### Option 2: Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name hyperliquid-db -e POSTGRES_DB=hyperliquid_funding_tracker -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine

# Set up environment
cp env.example .env.local
# Edit .env.local and add: DATABASE_URL="postgresql://postgres:password@localhost:5432/hyperliquid_funding_tracker"

# Run migrations
npm run db:migrate
```

### Option 3: Cloud Database
- Use Supabase, Railway, or any PostgreSQL provider
- Update DATABASE_URL in .env.local

## 🚀 After Database Setup

1. **Start data collection:**
   - Open http://localhost:3000
   - Click "Start Collection" to begin fetching HyperLiquid data

2. **View analytics:**
   - Real-time funding rate charts
   - Yield calculations and volatility metrics
   - Filter by trading pairs

## 🔧 Current Status

- ✅ Next.js server running
- ✅ Prisma client generated
- ✅ All dependencies installed
- ⏳ Database connection needed
- ⏳ HyperLiquid API integration ready

## 🧪 Test the Application

Visit http://localhost:3000/test to see the working application.

The main dashboard will be available at http://localhost:3000 once the database is set up. 