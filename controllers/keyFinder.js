import fetch from 'node-fetch'; // Import fetch for making HTTP requests

async function findKey(url) {
    try {
        console.log("Finding Keys for ", url)
        url = `https://extractapi.xyz/drm.php?v=${url}`
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
                "Accept": "application/json", 
                "Accept-Language": "en-US,en;q=0.5",
            },
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Convert response to JSON format
        console.log("Got Keys ", data.keys[0])
        return data.keys[0]; // Return keys[0]
    } catch (error) {
        throw new Error(`Error: ${error.message}`);
    }
}

export default findKey;
