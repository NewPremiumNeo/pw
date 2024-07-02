import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';

const convertMPDToHLS = async (mpdId, quality) => {
    try {
        let mpdUrl = `https://d1d34p8vz63oiq.cloudfront.net/${mpdId}/master.mpd`;
        
        // Fetch the MPD file
        const response = await fetch(mpdUrl);
        const xmlText = await response.text();

        // const mpdId = mpdUrl.split('/').slice(-2, -1)[0];
        // console.log(mpdId);

        // Parse the MPD XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        // Find the 720p representation
        const adaptationSets = xmlDoc.getElementsByTagName("AdaptationSet");
        let representation = null;
        for (let i = 0; i < adaptationSets.length; i++) {
            const reps = adaptationSets[i].getElementsByTagName("Representation");
            for (let j = 0; j < reps.length; j++) {
                if (reps[j].getAttribute("width") === "1280" && reps[j].getAttribute("height") === quality) {
                    representation = reps[j];
                    break;
                }
                else if (reps[j].getAttribute("height") === quality) {
                    representation = reps[j];
                    break;
                }
            }
            if (representation) break;
        }

        if (!representation) {
            throw new Error(`${quality}p representation not found`);
        }

        // Extract segments and durations
        const segmentTemplate = representation.getElementsByTagName("SegmentTemplate")[0];
        const media = segmentTemplate.getAttribute("media");
        const initialization = segmentTemplate.getAttribute("initialization");
        const timescale = parseInt(segmentTemplate.getAttribute("timescale"));
        const segments = segmentTemplate.getElementsByTagName("S");

        // Base URL for segments
        const baseUrl = `https://d1bppx4iuv3uee.cloudfront.net/${mpdId}/hls/${quality}/`;
        const segmentExtension = '.ts';

        // Generate HLS playlist
        let hlsPlaylist = "#EXTM3U\n";
        hlsPlaylist += "#EXT-X-VERSION:3\n";
        hlsPlaylist += "#EXT-X-TARGETDURATION:6\n";
        hlsPlaylist += "#EXT-X-MEDIA-SEQUENCE:0\n";
        hlsPlaylist += "#EXT-X-PLAYLIST-TYPE:VOD\n";

        // Add key (optional, modify as needed)
        hlsPlaylist += `#EXT-X-KEY:METHOD=AES-128,URI="https://dl.pwjarvis.com/api/get-hls-key?id=${mpdId}",IV=0x00000000000000000000000000000000\n`;

        // Add media segments
        let segmentNumber = parseInt(segmentTemplate.getAttribute("startNumber")) - 1;
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const duration = parseInt(segment.getAttribute("d")) / timescale;
            const repeat = segment.getAttribute("r") ? parseInt(segment.getAttribute("r")) : 0;

            for (let j = 0; j <= repeat; j++) {
                const segmentUrl = `${baseUrl}${segmentNumber.toString().padStart(3, '0')}${segmentExtension}`;
                hlsPlaylist += `#EXTINF:${duration.toFixed(6)},\n\n`;
                hlsPlaylist += `${segmentUrl}\n`;
                segmentNumber++;
            }
        }

        // End of playlist
        hlsPlaylist += "#EXT-X-ENDLIST\n";

        return hlsPlaylist;
    } catch (error) {
        console.error("Error converting MPD to HLS:", error);
    }
};

export { convertMPDToHLS };
