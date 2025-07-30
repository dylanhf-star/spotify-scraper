const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { getPreview } = require('spotify-url-info')(fetch);
const path = require('path');
const { 
    isValidSpotifyUrl, 
    cleanSpotifyUrl, 
    readInputFile, 
    writeOutputFile, 
    formatTrackInfo 
} = require('./utils');

async function processSpotifyUrl(url) {
    try {
        const cleanUrl = cleanSpotifyUrl(url);
        console.log(`Processing: ${cleanUrl}`);
        
        const trackData = await getPreview(cleanUrl);
        return formatTrackInfo(trackData);
    } catch (error) {
        console.error(`Failed to process ${url}: ${error.message}`);
        return `Error processing: ${url}`;
    }
}

async function processSpotifyLinks(inputFile, outputFile) {
    try {
        console.log(`Reading input file: ${inputFile}`);
        const urls = await readInputFile(inputFile);
        
        if (urls.length === 0) {
            console.log('No URLs found in input file.');
            return;
        }
        
        console.log(`Found ${urls.length} lines to process`);
        const results = [];
        
        for (const url of urls) {
            if (!url) continue;
            
            if (!isValidSpotifyUrl(url)) {
                console.warn(`Skipping invalid URL: ${url}`);
                results.push(`Invalid URL: ${url}`);
                continue;
            }
            
            const result = await processSpotifyUrl(url);
            results.push(result);
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const outputContent = results.join('\n');
        await writeOutputFile(outputFile, outputContent);
        
        console.log(`\nProcessing complete!`);
        console.log(`Processed ${urls.length} URLs`);
        console.log(`Results saved to: ${outputFile}`);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

function showUsage() {
    console.log('Usage: node src/index.js <input-file> [output-file]');
    console.log('');
    console.log('Arguments:');
    console.log('  input-file   Text file containing Spotify URLs (one per line)');
    console.log('  output-file  Output file path (optional, defaults to playlist.txt)');
    console.log('');
    console.log('Example:');
    console.log('  node src/index.js spotify-links.txt my-playlist.txt');
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        showUsage();
        return;
    }
    
    const inputFile = args[0];
    const outputFile = args[1] || 'playlist.txt';
    
    if (!inputFile) {
        console.error('Error: Input file is required');
        showUsage();
        process.exit(1);
    }
    
    await processSpotifyLinks(inputFile, outputFile);
}

if (require.main === module) {
    main().catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { processSpotifyLinks, processSpotifyUrl };