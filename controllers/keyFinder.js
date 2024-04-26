import fetch from 'node-fetch'; // Import fetch for making HTTP requests

async function findKey(url) {
    try {
        console.log("Finding Keys for ", url)
        url = `https://extractkey.vercel.app/pw?videourl=${url}`
        const response = await fetch(url, {
            method: "GET",
        });
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw error;
        }

        const data = await response.json();
        console.log("Got Keys ", data)
        return data; 
    } catch (error) {
        console.error(`Error: ${error.message}`);
        throw error;
    }
}

export default findKey;
