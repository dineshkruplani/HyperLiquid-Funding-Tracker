# HyperLiquid Funding Tracker

A real-time funding rate analytics platform for HyperLiquid perpetual swaps, built with Next.js, TypeScript, and PostgreSQL.

## Features

- **Real-time Data Collection**: Continuously fetches funding rate data from HyperLiquid APIs
- **Advanced Analytics**: Calculates yield statistics, volatility, and trend analysis
- **Interactive Dashboard**: Beautiful charts and metrics for data visualization
- **Multi-timeframe Analysis**: Support for 1h, 4h, 1d, 1w, and 1m periods
- **Instrument Filtering**: Filter data by specific trading pairs
- **Historical Data**: Store and analyze historical funding rate data
- **Responsive Design**: Modern UI that works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React icons
- **Charts**: Recharts for data visualization
- **Database**: PostgreSQL with Prisma ORM
- **Data Collection**: Axios for API calls, WebSocket support
- **Analytics**: Custom analytics engine for yield calculations

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hyperliquid-funding-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your database connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/hyperliquid_funding_tracker"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The application uses PostgreSQL with the following schema:

- **Instruments**: Trading pairs and their metadata
- **FundingRates**: Historical funding rate data
- **Analytics**: Pre-calculated analytics for different time periods
- **Alerts**: User-defined alerts and notifications

## API Endpoints

- `GET /api/instruments` - Get all trading instruments
- `GET /api/funding-rates` - Get funding rate data with optional filtering
- `GET /api/analytics` - Get analytics data for different periods
- `POST /api/collect` - Control data collection (start/stop/status)

## Data Collection

The platform automatically collects funding rate data from HyperLiquid:

1. **Initial Setup**: Fetches available instruments and creates database records
2. **Continuous Collection**: Polls funding rates every minute (configurable)
3. **Analytics Calculation**: Automatically calculates statistics for different time periods
4. **Real-time Updates**: Dashboard updates automatically with new data

## Usage

### Starting Data Collection

1. Open the dashboard
2. Click "Start Collection" to begin data collection
3. The system will automatically fetch and store funding rate data

### Viewing Analytics

- **Metrics Cards**: View current rates, averages, volatility, and yield
- **Charts**: Interactive charts showing funding rate history
- **Instrument Filtering**: Filter data by specific trading pairs
- **Time Periods**: Switch between different time periods (1h, 4h, 1d, etc.)

### Key Metrics

- **Current Rate**: Latest funding rate for selected instrument
- **Average Rate**: 24-hour average funding rate
- **Volatility**: Standard deviation of rates over time
- **Annualized Yield**: Projected annual yield based on current rates

## Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── analytics.ts      # Analytics calculations
│   ├── database.ts       # Database utilities
│   ├── data-collector.ts # Data collection service
│   ├── hyperliquid.ts    # HyperLiquid API integration
│   └── utils.ts          # Utility functions
├── prisma/               # Database schema and migrations
└── public/              # Static assets
```

### Adding New Features

1. **New API Endpoints**: Add routes in `app/api/`
2. **Database Changes**: Update `prisma/schema.prisma` and run migrations
3. **UI Components**: Create components in `components/`
4. **Analytics**: Extend `lib/analytics.ts` for new calculations

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `HYPERLIQUID_API_URL`: HyperLiquid API base URL
- `NEXT_PUBLIC_APP_URL`: Application URL for production

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   - Use a managed PostgreSQL service (e.g., Supabase, Railway)
   - Run migrations: `npm run db:migrate`

3. **Deploy to your preferred platform**
   - Vercel (recommended for Next.js)
   - Railway
   - DigitalOcean App Platform

4. **Configure environment variables**
   - Set production database URL
   - Configure API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

## Roadmap

- [ ] WebSocket support for real-time updates
- [ ] Advanced alerting system
- [ ] Export functionality for data
- [ ] Mobile app
- [ ] Additional DEX support
- [ ] Machine learning predictions 