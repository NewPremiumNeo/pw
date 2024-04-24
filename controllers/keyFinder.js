// keyFinder.js
import fetch from 'node-fetch'; // Import fetch for making HTTP requests

async function findKey(url) {
    try {
        url = `https://extractapi.xyz/drm.php?v=${url}`
        const response = await fetch(url, {
            credentials: "omit",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
                "Accept": "application/json", // Request JSON response
                "Accept-Language": "en-US,en;q=0.5",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "X-Forwarded-For": "144.208.40.186"
            },
            method: "GET",
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Convert response to JSON format
        return data.keys[0]; // Return keys[0]
    } catch (error) {
        throw new Error('Error:', error);
    }
}

export default findKey;
