const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function populateVenues() {
  try {
    console.log('Fetching data from HyperLiquid API...');
    
    // Fetch funding rates from HyperLiquid API
    const response = await axios.post('https://api.hyperliquid.xyz/info', {
      type: 'predictedFundings'
    });
    
    const data = response.data;
    console.log(`Fetched ${data.length} instruments`);
    
    // Get or create instruments
    let instruments = await prisma.instrument.findMany();
    if (instruments.length === 0) {
      console.log('No instruments found, creating from API data...');
      for (const item of data.slice(0, 10)) { // Limit to first 10 for testing
        const instrumentName = item[0];
        await prisma.instrument.create({
          data: {
            name: instrumentName,
            symbol: instrumentName,
            type: 'perp',
          },
        });
      }
      instruments = await prisma.instrument.findMany();
    }
    
    console.log(`Found ${instruments.length} instruments`);
    
    // Process each instrument
    for (const item of data.slice(0, 10)) { // Limit to first 10 for testing
      const instrumentName = item[0];
      const venueData = item[1];
      
      const instrument = instruments.find(i => i.symbol === instrumentName);
      if (!instrument) {
        console.log(`Instrument ${instrumentName} not found, skipping...`);
        continue;
      }
      
      console.log(`Processing ${instrumentName}...`);
      
      // Process each venue
      for (const venue of venueData) {
        const venueName = venue[0];
        const fundingInfo = venue[1];
        
        if (fundingInfo && typeof fundingInfo.fundingRate === 'string') {
          const rate = parseFloat(fundingInfo.fundingRate);
          if (!isNaN(rate)) {
            const timestamp = new Date();
            
            // Create funding rate record
            await prisma.fundingRate.upsert({
              where: {
                instrumentId_venue_timestamp: {
                  instrumentId: instrument.id,
                  venue: venueName,
                  timestamp: timestamp,
                },
              },
              update: {
                rate: rate,
                venue: venueName,
              },
              create: {
                instrumentId: instrument.id,
                rate: rate,
                venue: venueName,
                timestamp: timestamp,
              },
            });
            
            console.log(`  Created ${venueName}: ${rate}`);
          }
        }
      }
    }
    
    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateVenues(); 