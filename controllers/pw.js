import fetch from 'node-fetch';

async function paidBatches(token) {
    const url = 'https://api.penpencil.co/v3/batches/my-batches?mode=1&amount=paid&page=1';
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const extractedData = data.data.map(item => ({
            name: item.name,
            byName: item.byName,
            language: item.language,
            previewImage: `${item.previewImage.baseUrl}${item.previewImage.key}`,
            slug: item.slug
        }));
        const extractedJson = { data: extractedData };
        return extractedJson;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function freeBatches(token) {
    const url = 'https://api.penpencil.co/v3/batches/my-batches?mode=1&amount=free&page=1';
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const extractedData = data.data.map(item => ({
            name: item.name,
            byName: item.byName,
            language: item.language,
            previewImage: `${item.previewImage.baseUrl}${item.previewImage.key}`,
            slug: item.slug
        }));
        const extractedJson = { data: extractedData };
        return extractedJson;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function specificeBatch(token, batchName) {
    const url = `https://api.penpencil.co/v3/batches/${batchName}/details`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const subjectData = data.data.subjects
            .filter(item => item.imageId)
            .map(item => ({
                subject: item.subject,
                imageId: `${item.imageId.baseUrl}${item.imageId.key}`,
                slug: item.slug,
                tagCount: item.tagCount
            }));

        const extractedItem = {
            name: data.data.name,
            class: data.data.class,
            byName: data.data.byName,
            language: data.data.language,
            subjects: subjectData
        };
        const extractedJson = { data: extractedItem };
        return extractedJson;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function subjectListDetails(token, batchNameSlug, subjectSlug) {
    const url = `https://api.penpencil.co/v2/batches/${batchNameSlug}/subject/${subjectSlug}/topics?page=1`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Handle data as needed
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function videosBatch(token, batchNameSlug, subjectSlug, chapterSlug) {
    const url = `https://api.penpencil.co/v2/batches/${batchNameSlug}/subject/${subjectSlug}/contents?page=1&contentType=videos&tag=${chapterSlug}`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Handle data as needed
        const extractedData = [];
        data.data.forEach(item => {
            const extractedItem = {
                topic: item.topic,
                date: item.date,
                videoDetails: {
                    name: item.videoDetails.name,
                    image: item.videoDetails.image,
                    videoUrl: item.videoDetails.videoUrl || '',
                    embedCode: item.videoDetails.embedCode || '',
                    duration: item.videoDetails.duration
                }
            };
            extractedData.push(extractedItem);
        });
        const extractedJson = {
            data: extractedData
        };
        return extractedJson;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function videoNotes(token, batchNameSlug, subjectSlug, chapterSlug) {
    const url = `https://api.penpencil.co/v2/batches/${batchNameSlug}/subject/${subjectSlug}/contents?page=1&contentType=notes&tag=${chapterSlug}`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const extractedData = [];
        data.data.forEach(item => {
            item.homeworkIds.forEach(homework => {
                const extractedItem = {
                    topic: homework.topic,
                    note: homework.note,
                    pdfName: homework.attachmentIds[0].name,
                    pdfUrl: `${homework.attachmentIds[0].baseUrl}${homework.attachmentIds[0].key}`
                };
                extractedData.push(extractedItem);
            });
        });
        const extractedJson = {
            data: extractedData
        };
        return extractedJson;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function dppQuestions(token, batchNameSlug, subjectSlug, chapterSlug) {
    const url = `https://api.penpencil.co/v2/batches/${batchNameSlug}/subject/${subjectSlug}/contents?page=1&contentType=DppNotes&tag=${chapterSlug}`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const extractedData = [];
        data.data.forEach(item => {
            item.homeworkIds.forEach(homework => {
                const extractedItem = {
                    topic: homework.topic,
                    note: homework.note,
                    pdfName: homework.attachmentIds[0].name,
                    pdfUrl: `${homework.attachmentIds[0].baseUrl}${homework.attachmentIds[0].key}`
                };
                extractedData.push(extractedItem);
            });
        });
        const extractedJson = {
            data: extractedData
        };
        return extractedJson;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function dppVideos(token, batchNameSlug, subjectSlug, chapterSlug) {
    const url = `https://api.penpencil.co/v2/batches/${batchNameSlug}/subject/${subjectSlug}/contents?page=1&contentType=DppVideos&tag=${chapterSlug}`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const extractedData = [];
        data.data.forEach(item => {
            const extractedItem = {
                topic: item.topic,
                date: item.date,
                videoDetails: {
                    name: item.videoDetails.name,
                    image: item.videoDetails.image,
                    videoUrl: item.videoDetails.videoUrl || '',
                    embedCode: item.videoDetails.embedCode || '',
                    duration: item.videoDetails.duration
                }
            };
            extractedData.push(extractedItem);
        });
        const extractedJson = {
            data: extractedData
        };
        return extractedJson;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTQ0Mzc1MzAuOTA4LCJkYXRhIjp7Il9pZCI6IjYzZTMyNDU5MWE5NjY0MDAxODEwYWQyYSIsInVzZXJuYW1lIjoiODU3NDY5NDg1MCIsImZpcnN0TmFtZSI6Ik5pdGluIiwibGFzdE5hbWUiOiJLdW1hciBHdXB0ZSIsIm9yZ2FuaXphdGlvbiI6eyJfaWQiOiI1ZWIzOTNlZTk1ZmFiNzQ2OGE3OWQxODkiLCJ3ZWJzaXRlIjoicGh5c2ljc3dhbGxhaC5jb20iLCJuYW1lIjoiUGh5c2ljc3dhbGxhaCJ9LCJlbWFpbCI6Im5pdGluZ3VwdGF1bkBnbWFpbC5jb20iLCJyb2xlcyI6WyI1YjI3YmQ5NjU4NDJmOTUwYTc3OGM2ZWYiXSwiY291bnRyeUdyb3VwIjoiSU4iLCJ0eXBlIjoiVVNFUiJ9LCJpYXQiOjE3MTM4MzI3MzB9.BKEai9sxwmLMgdKMSTiRU9mOMRQJH9LnBTveXOSNeO4"

export { paidBatches, freeBatches, specificeBatch, subjectListDetails, videosBatch, videoNotes, dppQuestions, dppVideos };

