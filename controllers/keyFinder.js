import fetch from 'node-fetch'; // Import fetch for making HTTP requests

async function findKey(url) {
    try {
        console.log("Finding Keys for ", url)
        // url = `https://extractkey.vercel.app/pw?videourl=${url}`
        url = `https://pw-db-6a6ef38cc8ac.herokuapp.com/pw?videourl=${url}`
        const response = await fetch(url, {
            method: "GET",
        });
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw error;
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        console.error(`Error: ${error.message}`);
        throw error;
    }
}

export default findKey;
