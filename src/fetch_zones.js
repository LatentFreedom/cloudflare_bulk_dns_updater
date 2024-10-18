const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });  // Load .env from root directory

// Get Cloudflare API token from .env file
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Function to fetch all zones
const fetchAllZones = async () => {
    try {
        const response = await axios.get('https://api.cloudflare.com/client/v4/zones', {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.result; // Returns an array of zone objects
    } catch (error) {
        console.error('Error fetching zones:', error.response ? error.response.data : error.message);
        return [];
    }
};

// Function to save the zones into a JSON file
const saveZonesToJson = async () => {
    const zones = await fetchAllZones();

    // Map the zones to an array of { zone: zone.name, zoneId: zone.id }
    const zoneData = zones.map(zone => ({
        name: zone.name,
        zoneId: zone.id,
    }));

    // Define the output file path
    const outputPath = path.join(__dirname, '../data/cloudflare_zones.json');

    // Write the zone data to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(zoneData, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log(`Zone data saved to ${outputPath}`);
        }
    });

    console.log('Zones fetched and saved.');
};

// Run the function to fetch zones and save the JSON
saveZonesToJson();