import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PlayCircle, PauseCircle, Music2 } from 'lucide-react';

function RagaPlayer() {
  const [ragas, setRagas] = useState([]);
  const [time, setTime] = useState("morning");
  const [mood, setMood] = useState("peaceful");
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [selectedRaga, setSelectedRaga] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch ragas based on time and mood
  useEffect(() => {
    const fetchRagas = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/ragas/`, {
          params: { time_of_day: time, mood: mood }
        });
        console.log('Fetched ragas:', response.data); // Debug log
        setRagas(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching ragas:", err);
        setError("Failed to fetch ragas");
      }
    };

    fetchRagas();
  }, [time, mood]);
  
  // Get Spotify token when component mounts
  useEffect(() => {
    axios.get(`${API_BASE_URL}/spotify-token/`)
      .then(response => {
        setSpotifyToken(response.data.token);
        setError(null);
      })
      .catch(error => {
        console.error("Error fetching Spotify token:", error);
        setError("Failed to connect to Spotify");
      });
  }, []);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
    };

    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Search Spotify for tracks
  const searchSpotifyTracks = async (raga) => {
    setLoading(true);
    setSelectedRaga(raga);
    setTracks([]);
    setError(null);

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: `${raga.name} raga indian classical`,
          type: 'track',
          limit: 10
        },
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });

      const tracksWithPreviews = response.data.tracks.items.filter(
        track => track.preview_url
      );
      setTracks(tracksWithPreviews);
      
      if (tracksWithPreviews.length === 0) {
        setError("No previews available for this raga");
      }
    } catch (error) {
      console.error("Error searching Spotify:", error);
      setError("Failed to fetch tracks from Spotify");
    } finally {
      setLoading(false);
    }
  };


  // Handle track playback
  const togglePlayTrack = (track) => {
    const audio = audioRef.current;

    if (currentTrack && currentTrack.id === track.id) {
      // Same track - toggle play/pause
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      // New track - stop current and play new
      audio.pause();
      audio.src = track.preview_url;
      audio.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };


  return (
    <div className="App">
      {/* Added Header Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to RaagaVibes</h1>
          <p className="hero-subtitle">Discover the perfect raga for your moment</p>
        </div>
      </div>
        <div className="controls-section">
          <div>
            <h3>Time of Day</h3>
            <div className="button-group">
              {['morning', 'afternoon', 'evening', 'night'].map((timeOption) => (
                <button
                  key={timeOption}
                  onClick={() => setTime(timeOption)}
                  className={time === timeOption ? 'active' : ''}
                >
                  {timeOption}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3>Mood</h3>
            <div className="button-group">
              {['peaceful', 'energetic'].map((moodOption) => (
                <button
                  key={moodOption}
                  onClick={() => setMood(moodOption)}
                  className={mood === moodOption ? 'active' : ''}
                >
                  {moodOption}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ragas Display */}
        <div className="ragas-section">
          <h3>Available Ragas</h3>
          {error && <div className="error">{error}</div>}
          
          <div className="ragas-container">
            {ragas.map((raga) => (
              <div
                key={raga.id}
                className={`raga-item ${selectedRaga?.id === raga.id ? 'selected' : ''}`}
                onClick={() => searchSpotifyTracks(raga)}
              >
                <Music2 className="raga-icon" />
                <h4>{raga.name}</h4>
                <p>{raga.time_of_day} - {raga.mood}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks Display */}
        {selectedRaga && (
          <div className="tracks-section">
            <h3>Tracks for {selectedRaga.name}</h3>
            
            {loading && <div className="loading">Loading tracks...</div>}

            {!loading && tracks.length > 0 && (
              <div className="tracks-container">
                {tracks.map(track => (
                  <div key={track.id} className="track-item">
                    <div className="track-image">
                      {track.album.images[1] && (
                        <img 
                          src={track.album.images[1].url} 
                          alt={track.album.name}
                        />
                      )}
                      <button
                        onClick={() => togglePlayTrack(track)}
                        className="play-button"
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <PauseCircle />
                        ) : (
                          <PlayCircle />
                        )}
                      </button>
                    </div>
                    <div className="track-info">
                      <h4>{track.name}</h4>
                      <p>{track.artists.map(artist => artist.name).join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    
  );
}

export default RagaPlayer;