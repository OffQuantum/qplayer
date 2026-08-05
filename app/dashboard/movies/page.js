"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchXtream } from '@/utils/xtream';
import styles from './page.module.css';

export default function MoviesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [account, setAccount] = useState(null);

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
      const data = await fetchXtream(acc.server, acc.username, acc.password, 'get_vod_categories');
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].category_id);
          loadMovies(acc, data[0].category_id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMovies = async (acc, categoryId) => {
    setLoadingMovies(true);
    setMovies([]);
    try {
      const data = await fetchXtream(acc.server, acc.username, acc.password, 'get_vod_streams', { category_id: categoryId });
      if (Array.isArray(data)) {
        setMovies(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMovies(false);
    }
  };

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    loadMovies(account, id);
  };

  const handleMovieClick = (movie) => {
    router.push(`/player?id=${movie.stream_id}&type=movie`);
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
        {loadingMovies ? (
          <div>Loading Movies...</div>
        ) : (
          <div className={styles.grid}>
            {movies.map(movie => (
              <div key={movie.stream_id} className={styles.card} onClick={() => handleMovieClick(movie)}>
                {movie.stream_icon ? (
                  <img 
                    src={movie.stream_icon} 
                    alt={movie.name} 
                    className={styles.cover} 
                    loading="lazy" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                ) : (
                  <div className={styles.cover} />
                )}
                <div className={styles.title}>{movie.name}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
