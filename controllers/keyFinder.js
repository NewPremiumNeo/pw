import fetch from 'node-fetch'; // Import fetch for making HTTP requests

async function findKey(url) {
    try {
        console.log("Finding Keys for ", url)
        url = `https://extractapi.xyz/drm.php?v=${url}`
        const response = await fetch(url, {
            method: "GET",
        });
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw error;
        }

        const data = await response.json();
        console.log("Got Keys ", data.keys[0])
        return data.keys[0]; 
    } catch (error) {
        console.error(`Error: ${error.message}`);
        throw error;
    }
}

export default findKey;
