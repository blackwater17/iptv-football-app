import axios from 'axios';
import { MediaEntry } from '../src/interfaces';

export const fetchHTML = async (url: string) => {
    try {
        const response = await fetch(`/api/fetchHTML?url=${encodeURIComponent(url)}`);
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error fetching HTML:', error);
    }
};

export const runVLC = async (location: string) => {
    try {
        const response = await fetch('/api/runVLC', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location }),
        });

        if (response.ok) {
            // console.log('VLC started successfully.');
        } else {
            console.error('Failed to start VLC.');
        }
    } catch (error) {
        console.error('Error occurred while starting VLC:', error);
    }
};

export const getLeagueObjects = () => {

    return (
        [
            {
                url: "https://sport-tv-guide.live/tournament/football/europe/champions-league",
                name: "Champions League",
            },
            {
                url: "https://sport-tv-guide.live/tr/turnuva/futbol/ingiltere/premier-lig",
                name: "Premier League",
            },
            {
                url: "https://sport-tv-guide.live/tournament/football/turkey/super-lig",
                name: "Super Lig",
            },
            {
                url: "https://sport-tv-guide.live/tournament/football/spain/la-liga",
                name: "La Liga"
            },
            {
                url: "https://sport-tv-guide.live/tournament/football/italy/serie-a",
                name: "Serie A"
            },
            {
                url: "https://sport-tv-guide.live/tournament/football/germany/bundesliga",
                name: "Bundesliga"
            },
            {
                url: "https://sport-tv-guide.live/tournament/football/france/ligue-1",
                name: "Ligue 1"
            }
        ]
    )
}

// fetch found channels, highlight if exist
export const fetchFoundChannels = async (channelNames: string[]) => {
    try {
        
        // reset previous found classes
        document.querySelectorAll('.watch-from-container button.found').forEach(btn => btn.classList.remove("found"));
        
        for (let i = 0; i < channelNames.length; i++) {
            const channelName = channelNames[i];
            const response = await axios.get(`/api/findChannel?channelName=${encodeURIComponent(channelName)}`);
            const { found } = response.data;
            if (found) {
                const buttons = document.querySelectorAll('.watch-from-container button');
                buttons[i].classList.add('found');
            }
        }
    } catch (error) {
        console.error('Error querying API:', error);
    }
};

export function parseM3U(content: string): MediaEntry[] {
    const lines = content.split('\n');
    const mediaEntries: MediaEntry[] = [];

    for (let i = 1; i < lines.length; i += 2) {
        const extinf = lines[i].substring('#EXTINF:'.length).trim();

        // Extract properties from EXTINF line
        const [, tvgNameMatch] = extinf.match(/tvg-name="([^"]*)"/) || [];
        const [, tvgLogoMatch] = extinf.match(/tvg-logo="([^"]*)"/) || [];
        const [, groupTitleMatch] = extinf.match(/group-title="([^"]*)"/) || [];

        const tvgName = tvgNameMatch || '';
        const tvgLogo = tvgLogoMatch || '';
        const groupTitle = groupTitleMatch || '';

        const url = lines[i + 1].trim();

        mediaEntries.push({ url, tvgName, tvgLogo, groupTitle });
    }

    return mediaEntries;
}