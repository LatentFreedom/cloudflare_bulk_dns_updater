const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });  // Load .env from root directory

// Get Cloudflare API token and account ID from .env file
const GLOBAL_API_TOKEN = process.env.CLOUDFLARE_GLOBAL_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const ACCOUNT_EMAIL = process.env.CLOUDFLARE_ACCOUNT_EMAIL;

// Function to fetch registered domains and their auto-renewal status
const fetchAutorenewalStatus = async () => {
    try {
        const response = await axios.get(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/registrar/domains`, {
            headers: {
                'Authorization': 'Bearer',
                'Content-Type': 'application/json',
                'X-Auth-Email': ACCOUNT_EMAIL,
                'X-Auth-Key': GLOBAL_API_TOKEN
            },
        });

        const domains = response.data.result.map(domain => ({
            name: domain.name,
            current_registrar: domain.current_registrar,
            auto_renew: domain.auto_renew,
            privacy: domain.privacy,
            registry: domain.registry,
            registered_at: domain.registered_at,
            expires_on: domain.expires_at
        }));

        // Define the output file path
        const outputPath = path.join(__dirname, '../data/cloudflare_domain_records.json');

        // Write the A record data to a JSON file
        fs.writeFileSync(outputPath, JSON.stringify(domains, null, 2), (err) => {
            if (err) {
                console.error('Error writing domains to file:', err);
            } else {
                console.log(`Domain records saved to ${outputPath}`);
            }
        });

    console.log('Domain records fetched and saved.');


    } catch (error) {
        console.error('Error fetching domain auto-renewal status:', error.response ? error.response.data : error.message);
    }
};

// Run the function to fetch auto-renewal status
fetchAutorenewalStatus();