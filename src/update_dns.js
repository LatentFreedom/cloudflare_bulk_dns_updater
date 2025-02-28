const axios = require('axios');
const net = require('net');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Get Cloudflare API token and IP addresses from .env file
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const OLD_IP = process.env.OLD_IP;   // Replace with the old IP to be updated
const NEW_IP = process.env.NEW_IP;  // Replace with the new IP

// Function to validate IP addresses
const isValidIPAddress = (ip) => {
    return net.isIP(ip) !== 0;  // Returns 4 or 6 for valid IP, 0 for invalid
};

// Function to fetch all zones
const fetchAllZones = async () => {
    try {
        let allZones = [];
        let page = 1;
        let hasMorePages = true;
        
        while (hasMorePages) {
            const response = await axios.get('https://api.cloudflare.com/client/v4/zones', {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    page: page,
                    per_page: 50  // Maximum allowed by Cloudflare
                }
            });
            
            const { result, result_info } = response.data;
            allZones = [...allZones, ...result];
            
            // Check if we've reached the last page
            hasMorePages = result_info.page < result_info.total_pages;
            page++;
        }
        
        console.log(`Found ${allZones.length} zones in total`);
        return allZones;
    } catch (error) {
        console.error('Error fetching zones:', error.response ? error.response.data : error.message);
        return [];
    }
};

// Function to fetch all A records for a zone
const fetchARecords = async (zoneId, zoneName) => {
    try {
        let allRecords = [];
        let page = 1;
        let hasMorePages = true;
        
        while (hasMorePages) {
            const response = await axios.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    type: 'A',
                    page: page,
                    per_page: 100  // Maximum allowed by Cloudflare
                }
            });
            
            const { result, result_info } = response.data;
            allRecords = [...allRecords, ...result];
            
            // Check if we've reached the last page
            hasMorePages = result_info.page < result_info.total_pages;
            page++;
        }
        
        console.log(`Found ${allRecords.length} A records for domain ${zoneName}`);
        return allRecords;
    } catch (error) {
        console.error(`Error fetching A records for domain ${zoneName}:`, error.response ? error.response.data : error.message);
        return [];
    }
};

// Function to update a DNS record
const updateDNSRecord = async (zoneId, recordId, name, zoneName) => {
    try {
        await axios.put(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
            {
                type: 'A',
                name: name,
                content: NEW_IP,
                ttl: 1,  // Auto TTL
                proxied: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`Updating: ${name} (${zoneName}) from ${OLD_IP} to ${NEW_IP}`);
    } catch (error) {
        console.error(`Error updating DNS record ${name} (${zoneName}):`, error.response ? error.response.data : error.message);
    }
};

// Function to check IPs and update A records if necessary
const updateMatchingARecords = async () => {
    // Validate old and new IP addresses
    if (!isValidIPAddress(OLD_IP)) {
        console.error(`Invalid old IP address: ${OLD_IP}`);
        return;
    }

    if (!isValidIPAddress(NEW_IP)) {
        console.error(`Invalid new IP address: ${NEW_IP}`);
        return;
    }

    const zones = await fetchAllZones();

    // Loop through each zone and fetch its A records
    for (const zone of zones) {
        const aRecords = await fetchARecords(zone.id, zone.name);

        // Loop through each A record and update if necessary
        for (const record of aRecords) {
            const currentIP = record.content;  // Get the current IP of the DNS record

            // Case 1: If the DNS record already has the new IP
            if (currentIP === NEW_IP) {
                console.log(`No update: ${record.name} (${zone.name}) is already ${NEW_IP}`);
            }
            // Case 2: If the DNS record has the old IP, update it to the new IP
            else if (currentIP === OLD_IP) {
                console.log(`Updating: ${record.name} (${zone.name}) from ${OLD_IP} to ${NEW_IP}`);
                await updateDNSRecord(zone.id, record.id, record.name, zone.name);
            }
            // Case 3: If the DNS record has a different IP than the old IP, skip it
            else {
                console.log(`Skipping: ${record.name} (${zone.name}) (current IP: ${currentIP})`);
            }
        }
    }

    console.log('DNS update completed.');
};

// Run the function to update matching A records
updateMatchingARecords();