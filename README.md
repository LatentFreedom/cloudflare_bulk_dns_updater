
# Cloudflare Bulk DNS Updating

This project provides scripts to bulk-update Cloudflare A records by changing all DNS entries from an old IP address to a new IP address. This is useful when migrating services or updating infrastructure without manually updating each DNS record.

## Features
- **Bulk DNS updates**: Automatically update all A records in your Cloudflare zones from `OLD_IP` to `NEW_IP`.
- **Zone and Record Inspection**: Fetch all zones and their A records to review or verify configurations before updating.
  
## Prerequisites
- **Node.js** (v12 or higher)
- **Cloudflare API Token**: Ensure your token has sufficient permissions (`Zone:Read` and `DNS:Edit`).

## Steps to Run

1. Install the necessary packages with:
   ```bash
   npm install
   ```
   
2. Add your **Cloudflare API token** and **IP addresses** to the `.env` file:
   ```bash
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
   OLD_IP=old_ip_address
   NEW_IP=new_ip_address
   ```

3. Run the DNS update script:
   ```bash
   npm run updatedns
   ```

This will check for all A records with the `OLD_IP` and update them to the `NEW_IP`.

## Scripts Overview

### Fetch Zones (`fetchzones`)
Fetch all the zones in your Cloudflare account. The results are saved to `/data/cloudflare_zones.json`, allowing you to inspect the list of your zones.

```bash
npm run fetchzones
```

### Fetch A Records (`fetchzonesa`)
Fetch all the A records for each zone in your Cloudflare account. This information is saved to `/data/cloudflare_a_records.json`, which includes details of the DNS records and their IPs.

```bash
npm run fetchzonesa
```

### Update DNS Records (`updatedns`)
Update all DNS A records that match the `OLD_IP` to the `NEW_IP`.

```bash
npm run updatedns
```

## .env Values
Ensure your `.env` file is populated with the following values:

```plaintext
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
OLD_IP=old_ip_address
NEW_IP=new_ip_address
```

## Notes
- **Error Handling**: The script validates IP addresses before making any updates. If the IPs are invalid, an error will be displayed and the script will exit.
- **Data Files**: You can browse the fetched zone data in `/data/cloudflare_zones.json` and the A records in `/data/cloudflare_a_records.json`.
- **Logging**: The script provides detailed logs on actions like skipping records, updating records, and any errors encountered.

## Example Output
Here is an example output when running the update script:

```bash
Updating: subdomain.example.com from 123.45.67.89 to 98.76.54.32
No update: www.example.com is already 98.76.54.32
Skipping: blog.example.com (current IP: 111.22.33.44)
DNS update completed.
```

This provides a clear log of which records are updated, skipped, or already set to the new IP.
