const fs = require('fs').promises;

function isValidSpotifyUrl(url) {
    const spotifyUrlRegex = /^https?:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/[a-zA-Z0-9]+(\?.*)?$/;
    return spotifyUrlRegex.test(url.trim());
}

function cleanSpotifyUrl(url) {
    const cleanUrl = url.trim();
    const urlParts = cleanUrl.split('?');
    return urlParts[0];
}

async function readInputFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    } catch (error) {
        throw new Error(`Failed to read input file: ${error.message}`);
    }
}

async function writeOutputFile(filePath, content) {
    try {
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`Output written to: ${filePath}`);
    } catch (error) {
        throw new Error(`Failed to write output file: ${error.message}`);
    }
}

function formatTrackInfo(trackData) {
    const title = trackData.title || 'Unknown Title';
    const artist = trackData.artist || 'Unknown Artist';
    return `${title} - ${artist}`;
}

module.exports = {
    isValidSpotifyUrl,
    cleanSpotifyUrl,
    readInputFile,
    writeOutputFile,
    formatTrackInfo
};