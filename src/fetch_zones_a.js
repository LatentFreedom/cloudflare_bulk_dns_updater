const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });  // Load .env from root directory

// Get Cloudflare API token from .env file
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Function to fetch all A records for a zone
const fetchARecords = async (zoneId) => {
    try {
        const response = await axios.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.result; // Returns an array of DNS records
    } catch (error) {
        console.error(`Error fetching A records for zone ${zoneId}:`, error.response ? error.response.data : error.message);
        return [];
    }
};

// Function to fetch zones from cloudflare_zones.json
const getZonesFromJson = () => {
    const filePath = path.join(__dirname, '../data/cloudflare_zones.json');
    try {
        const zones = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return zones;
    } catch (err) {
        console.error('Error reading zones JSON file:', err);
        return [];
    }
};

// Function to fetch all A records for all zones and save them to a JSON file
const fetchAllARecordsAndSave = async () => {
    const zones = getZonesFromJson();
    let allARecords = [];

    // Loop through each zone and fetch its A records
    for (const zone of zones) {
        console.log(`Fetching A records for ${zone.name}`);
        const aRecords = await fetchARecords(zone.zoneId);

        // Push each A record along with its zone name
        aRecords.forEach(record => {
            allARecords.push({
                zone: zone.name,
                name: record.name,  // Subdomain or domain name
                recordId: record.id,
                content: record.content  // IP address
            });
        });
    }

    // Define the output file path
    const outputPath = path.join(__dirname, '../data/cloudflare_a_records.json');

    // Write the A record data to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(allARecords, null, 2), (err) => {
        if (err) {
            console.error('Error writing A records to file:', err);
        } else {
            console.log(`A records saved to ${outputPath}`);
        }
    });

    console.log('A records fetched and saved.');
};

// Run the function to fetch A records and save them
fetchAllARecordsAndSave();