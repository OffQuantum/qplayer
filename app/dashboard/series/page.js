"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchXtream } from '@/utils/xtream';
import styles from './page.module.css';

export default function SeriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [account, setAccount] = useState(null);
  
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('active_account');
    if (saved) {
      const acc = JSON.parse(saved);
      setAccount(acc);
      loadCategories(acc);
    } else {
      router.push('/');
    }
  }, [router]);

  const loadCategories = async (acc) => {
    try {
      const data = await fetchXtream(acc.server, acc.username, acc.password, 'get_series_categories');
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].category_id);
          loadSeries(acc, data[0].category_id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSeries = async (acc, categoryId) => {
    setLoadingSeries(true);
    setSeries([]);
    try {
      const data = await fetchXtream(acc.server, acc.username, acc.password, 'get_series', { category_id: categoryId });
      if (Array.isArray(data)) {
        setSeries(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSeries(false);
    }
  };

  const loadEpisodes = async (acc, seriesId) => {
    try {
      const data = await fetchXtream(acc.server, acc.username, acc.password, 'get_series_info', { series_id: seriesId });
      if (data && data.episodes) {
        // Flatten episodes object into array
        let eps = [];
        Object.values(data.episodes).forEach(season => {
          eps = [...eps, ...season];
        });
        setEpisodes(eps);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCategoryClick = (id) => {
    setSelectedSeries(null);
    setActiveCategory(id);
    loadSeries(account, id);
  };

  const handleSeriesClick = (s) => {
    setSelectedSeries(s);
    setEpisodes([]);
    loadEpisodes(account, s.series_id);
  };

  const handleEpisodeClick = (ep) => {
    router.push(`/player?id=${ep.id}&type=series&name=${encodeURIComponent(ep.title || 'Episode')}&ext=${ep.container_extension || 'mp4'}`);
  };

  if (loading) return <div>Loading Categories...</div>;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        {categories.map(cat => (
          <div 
            key={cat.category_id} 
            className={`${styles.categoryItem} ${activeCategory === cat.category_id ? styles.active : ''}`}
            onClick={() => handleCategoryClick(cat.category_id)}
          >
            {cat.category_name}
          </div>
        ))}
      </aside>
      <main className={styles.content}>
        {selectedSeries ? (
          <div className={styles.overlay}>
            <div className={styles.backBtn} onClick={() => setSelectedSeries(null)}>← Back to Series</div>
            <h2>{selectedSeries.name}</h2>
            <div className={styles.episodesList} style={{ marginTop: '2rem' }}>
              {episodes.length === 0 ? <div>Loading Episodes...</div> : (
                episodes.map(ep => (
                  <div key={ep.id} className={styles.episodeItem} onClick={() => handleEpisodeClick(ep)}>
                    <span>S{ep.season} E{ep.episode_num} - {ep.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : loadingSeries ? (
          <div>Loading Series...</div>
        ) : (
          <div className={styles.grid}>
            {series.map(s => (
              <div key={s.series_id} className={styles.card} onClick={() => handleSeriesClick(s)}>
                {s.cover ? (
                  <img 
                    src={s.cover} 
                    alt={s.name} 
                    className={styles.cover} 
                    loading="lazy" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                ) : (
                  <div className={styles.cover} />
                )}
                <div className={styles.title}>{s.name}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
