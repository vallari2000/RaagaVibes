import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

export const getSpotifyToken = async (code) => {
    try {
        const response = await fetch('http://localhost:8000/api/get_spotify_token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        const data = await response.json();
        spotifyApi.setAccessToken(data.access_token);
    } catch (error) {
        console.error('Error fetching Spotify token:', error);
    }
};

export default spotifyApi;
