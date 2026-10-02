/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { VideosSection } from './components/VideosSection';
import { MusicSection } from './components/MusicSection';
import { MiniPlayer } from './components/MiniPlayer';
import { ReelsSection } from './components/ReelsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ShowreelModal } from './components/ShowreelModal';
import { RadioPlayerModal } from './components/RadioPlayerModal';
import { LayerGuideModal } from './components/LayerGuideModal';
import { SmoothPreloader } from './components/SmoothPreloader';
import { audioEngine } from './utils/audioEngine';
import { MUSIC_TRACKS, Track } from './data/content';
import { fetchMusicSheets } from './services/musicSheetsService';

export default function App() {
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [radioOpen, setRadioOpen] = useState(false);
  const [layerGuideOpen, setLayerGuideOpen] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [musicTracks, setMusicTracks] = useState<Track[]>(MUSIC_TRACKS);

  // Sync Top Ranking tracks with Google Sheets live & auto-update
  useEffect(() => {
    const syncTracks = () => {
      fetchMusicSheets(true).then((tracks) => {
        if (tracks && tracks.length > 0) {
          setMusicTracks(tracks);
        }
      });
    };
    syncTracks();
    const interval = setInterval(syncTracks, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setIsPlayingAudio(state.isPlaying);
      if (state.trackId) {
        setCurrentTrackId(state.trackId);
        setShowMiniPlayer(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePlayTrack = (track: Track) => {
    audioEngine.playClickFx();
    if (isPlayingAudio && currentTrackId === track.id) {
      audioEngine.pause();
    } else {
      audioEngine.playTrack(track.id, track.audioFrequency, track.bpm, track.durationSec, track.audioUrl);
      setCurrentTrackId(track.id);
      setShowMiniPlayer(true);
    }
  };

  const handlePlayNextTrack = () => {
    const currentIndex = musicTracks.findIndex((t) => t.id === currentTrackId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % musicTracks.length;
    const nextTrack = musicTracks[nextIndex];
    handlePlayTrack(nextTrack);
  };

  const handlePlayPrevTrack = () => {
    const currentIndex = musicTracks.findIndex((t) => t.id === currentTrackId);
    const prevIndex = currentIndex <= 0 ? musicTracks.length - 1 : currentIndex - 1;
    const prevTrack = musicTracks[prevIndex];
    handlePlayTrack(prevTrack);
  };

  const scrollToContact = () => {
    const contactElem = document.querySelector('#contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen text-[#FAF7FD] overflow-x-hidden bg-[#140824]">
      {/* Authentic Master Site Background Image from User: https://imgur.com/a/JcEseO2 */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out"
        style={{
          backgroundImage: `url('/site-background.jpg')`,
        }}
      />

      {/* Cinematic Studio Vignette & Atmospheric Contrast Overlay */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 25%, rgba(26, 12, 45, 0.30) 0%, rgba(20, 9, 36, 0.50) 55%, rgba(16, 7, 28, 0.65) 100%)',
        }}
      />

      {/* Water Fill Preloader based on user code */}
      {showPreloader && (
        <SmoothPreloader
          duration={3200}
          onComplete={() => setShowPreloader(false)}
        />
      )}

      {/* Cinematic Film-Grain Texture Overlay (Barely perceptible, adds rich analog depth) */}
      <div className="film-grain fixed inset-0 pointer-events-none z-30 opacity-25" />

      {/* Primary Fixed Editorial Navigation */}
      <Header
        onOpenContact={scrollToContact}
        onOpenRadio={() => setRadioOpen(true)}
        onOpenShowreel={() => setShowreelOpen(true)}
      />

      <main>
        {/* Hero Section matching Screenshot 1 */}
        <Hero
          onOpenRadio={() => setRadioOpen(true)}
          onOpenLayerGuide={() => setLayerGuideOpen(true)}
        />

        {/* TV ONLINE Section with Urban Modern TV Aesthetic */}
        <VideosSection />

        {/* The Sound / Music Archive & Interactive Audio */}
        <MusicSection
          currentTrackId={currentTrackId}
          isPlaying={isPlayingAudio}
          onPlayTrack={handlePlayTrack}
          tracks={musicTracks}
        />

        {/* Short-form Reels & TikTok Life in Motion Grid */}
        <ReelsSection />

        {/* Contact / Inquiries Section */}
        <ContactSection />
      </main>

      {/* Luxury Footer */}
      <Footer
        onOpenContact={scrollToContact}
        onReplayPreloader={() => setShowPreloader(true)}
      />

      {/* Sticky Bottom Mini Player (Activated upon track playback) */}
      {showMiniPlayer && currentTrackId && (
        <MiniPlayer
          currentTrackId={currentTrackId}
          isPlaying={isPlayingAudio}
          tracks={musicTracks}
          onClose={() => {
            audioEngine.pause();
            setShowMiniPlayer(false);
          }}
          onPlayNext={handlePlayNextTrack}
          onPlayPrev={handlePlayPrevTrack}
        />
      )}

      {/* Apple Music Style Live Radio Player Modal */}
      <RadioPlayerModal
        isOpen={radioOpen}
        onClose={() => setRadioOpen(false)}
      />

      {/* Fullscreen 4K Showreel Modal */}
      <ShowreelModal
        isOpen={showreelOpen}
        onClose={() => setShowreelOpen(false)}
      />

      {/* Layer Guide Modal corresponding to "Guía de Capas" in Screenshot 1 */}
      <LayerGuideModal
        isOpen={layerGuideOpen}
        onClose={() => setLayerGuideOpen(false)}
      />
    </div>
  );
}
