"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchXtream } from '@/utils/xtream';
import { Search } from 'lucide-react';
import { t } from '@/utils/lang';
import styles from './page.module.css';

export default function SearchPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [query, setQuery] = useState('');
  const [searchMovies, setSearchMovies] = useState(true);
  const [searchSeries, setSearchSeries] = useState(true);
  
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Series Episode selection overlay state
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('active_account');
    if (saved) {
      setAccount(JSON.parse(saved));
    } else {
      router.push('/');
    }
  }, [router]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || !account) return;

    setIsSearching(true);
    setHasSearched(true);
    setResults([]);
    setSelectedSeries(null);

    try {
      const allResults = [];

      // If neither is checked, we default to doing both
      const doMovies = searchMovies || (!searchMovies && !searchSeries);
      const doSeries = searchSeries || (!searchMovies && !searchSeries);

      // Fetch all VODs and filter locally
      if (doMovies) {
        const vodData = await fetchXtream(account.server, account.username, account.password, 'get_vod_streams');
        if (Array.isArray(vodData)) {
          const qLower = query.toLowerCase();
          const filtered = vodData.filter(v => v.name && v.name.toLowerCase().includes(qLower));
          allResults.push(...filtered.map(v => ({ ...v, itemType: 'movie' })));
        }
      }

      // Fetch all Series and filter locally
      if (doSeries) {
        const seriesData = await fetchXtream(account.server, account.username, account.password, 'get_series');
        if (Array.isArray(seriesData)) {
          const qLower = query.toLowerCase();
          const filtered = seriesData.filter(s => s.name && s.name.toLowerCase().includes(qLower));
          allResults.push(...filtered.map(s => ({ ...s, itemType: 'series' })));
        }
      }

      setResults(allResults);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.itemType === 'movie') {
      router.push(`/player?id=${item.stream_id}&type=movie`);
    } else if (item.itemType === 'series') {
      setSelectedSeries(item);
      loadEpisodes(item.series_id);
    }
  };

  const loadEpisodes = async (seriesId) => {
    setLoadingEpisodes(true);
    setEpisodes([]);
    try {
      const data = await fetchXtream(account.server, account.username, account.password, 'get_series_info', { series_id: seriesId });
      if (data && data.episodes) {
        let eps = [];
        Object.values(data.episodes).forEach(season => {
          eps = [...eps, ...season];
        });
        setEpisodes(eps);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleEpisodeClick = (ep) => {
    router.push(`/player?id=${ep.id}&type=series&name=${encodeURIComponent(ep.title || 'Episode')}&ext=${ep.container_extension || 'mp4'}`);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <input 
              type="checkbox" 
              checked={searchMovies} 
              onChange={(e) => setSearchMovies(e.target.checked)} 
            /> 
            {t.movies}
          </label>
          <label className={styles.filterLabel}>
            <input 
              type="checkbox" 
              checked={searchSeries} 
              onChange={(e) => setSearchSeries(e.target.checked)} 
            /> 
            {t.series}
          </label>
        </div>
        <button type="submit" className={styles.searchBtn} disabled={isSearching || !query.trim()}>
          {isSearching ? t.searching : <Search size={20} />}
        </button>
      </form>

      <div className={styles.resultsArea}>
        {selectedSeries ? (
          <div className={styles.overlay}>
            <div className={styles.backBtn} onClick={() => setSelectedSeries(null)}>{t.backToResults}</div>
            <h2>{selectedSeries.name}</h2>
            <div className={styles.episodesList} style={{ marginTop: '2rem' }}>
              {loadingEpisodes ? <div className={styles.loadingText}>{t.loadingEpisodes}</div> : (
                episodes.length === 0 ? <div>{t.noEpisodes}</div> : (
                  episodes.map(ep => (
                    <div key={ep.id} className={styles.episodeItem} onClick={() => handleEpisodeClick(ep)}>
                      <span>S{ep.season} E{ep.episode_num} - {ep.title}</span>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        ) : isSearching ? (
          <div className={styles.loadingText}>{t.searchingLong}</div>
        ) : hasSearched && results.length === 0 ? (
          <div className={styles.loadingText}>{t.noResults} "{query}".</div>
        ) : (
          <div className={styles.grid}>
            {results.map((item, i) => (
              <div 
                key={`${item.itemType}-${item.stream_id || item.series_id}-${i}`} 
                className={styles.card} 
                onClick={() => handleItemClick(item)}
              >
                {item.stream_icon || item.cover ? (
                  <img 
                    src={item.stream_icon || item.cover} 
                    alt={item.name} 
                    className={styles.cover} 
                    loading="lazy" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                ) : (
                  <div className={styles.cover} />
                )}
                <div className={styles.typeBadge}>{item.itemType}</div>
                <div className={styles.title}>{item.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
