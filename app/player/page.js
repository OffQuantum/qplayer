"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Hls from 'hls.js';
import { getStreamUrl, fetchXtream } from '@/utils/xtream';
import { saveProgress, getProgress } from '@/utils/progress';
import styles from './page.module.css';

export default function Player() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef(null);
  
  const streamId = searchParams.get('id');
  const type = searchParams.get('type'); // 'live', 'movie', 'series'
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    if (!streamId || !type) {
      router.push('/dashboard');
      return;
    }

    const savedAccount = localStorage.getItem('active_account');
    if (!savedAccount) {
      router.push('/');
      return;
    }
    const account = JSON.parse(savedAccount);

    let hls;
    let tsPlayer;

    const setupPlayer = async () => {
      try {
        // Fetch metadata
        let name = 'Unknown Video';
        let cover = '';
        let ext = '';
        
        if (type === 'movie') {
          const info = await fetchXtream(account.server, account.username, account.password, 'get_vod_info', { vod_id: streamId });
          if (info && info.info) {
            name = info.info.name || name;
            cover = info.info.movie_image || '';
            ext = info.movie_data?.container_extension || 'mp4';
          }
        } else if (type === 'series') {
           name = searchParams.get('name') || 'Series Episode';
           ext = searchParams.get('ext') || 'mp4';
        } else if (type === 'live') {
           name = searchParams.get('name') || 'Live Stream';
           ext = 'ts'; // IPTV providers usually supply TS natively, HLS is often broken
        }
        
        const m = { name, cover };
        setMetadata(m);

        const url = getStreamUrl(account.server, account.username, account.password, type, streamId, ext);
        const video = videoRef.current;

        if (type === 'live' && ext === 'ts') {
          const mpegts = require('mpegts.js');
          if (mpegts.getFeatureList().mseLivePlayback) {
            tsPlayer = mpegts.createPlayer({
              type: 'mpegts',
              isLive: true,
              url: url
            });
            tsPlayer.attachMediaElement(video);
            tsPlayer.load();
            tsPlayer.play().catch(e => console.log('Autoplay blocked'));
            tsPlayer.on(mpegts.Events.ERROR, (errType, errDetail) => {
              setError(`Stream Error: ${errDetail}`);
              setLoading(false);
            });
            setLoading(false);
          } else {
            setError('Browser does not support TS playback.');
            setLoading(false);
          }
        } else if (ext === 'm3u8') {
          if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setLoading(false);
              resumeVideo(video, m);
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                setError('Failed to load stream.');
                setLoading(false);
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
              setLoading(false);
              resumeVideo(video, m);
            });
          }
        } else {
          // MP4, MKV
          video.src = url;
          video.addEventListener('loadedmetadata', () => {
            setLoading(false);
            resumeVideo(video, m);
          });
          video.addEventListener('error', () => {
            setError('Failed to load video.');
            setLoading(false);
          });
        }
      } catch (err) {
        setError('Error setting up player.');
        setLoading(false);
      }
    };

    setupPlayer();

    return () => {
      if (hls) hls.destroy();
      if (tsPlayer) tsPlayer.destroy();
    };
  }, [streamId, type, router, searchParams]);

  const resumeVideo = (video, meta) => {
    // Only resume VOD/Series
    if (type !== 'live') {
      const saved = getProgress(streamId);
      if (saved && saved.time) {
        video.currentTime = saved.time;
      }
    }
    video.play().catch(e => console.log('Autoplay blocked', e));
  };

  const handleTimeUpdate = () => {
    if (type !== 'live' && videoRef.current) {
      const time = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (metadata) {
        saveProgress(streamId, type, time, duration, metadata);
      }
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.back()}>
        <ArrowLeft size={20} /> Back
      </button>
      
      {loading && <div className={styles.loading}>Loading Stream...</div>}
      {error && <div className={styles.loading}>{error}</div>}
      
      <video
        ref={videoRef}
        className={styles.video}
        controls
        onTimeUpdate={handleTimeUpdate}
        style={{ display: (loading || error) ? 'none' : 'block' }}
      />
    </div>
  );
}
