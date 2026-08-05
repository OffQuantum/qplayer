"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchXtream } from '@/utils/xtream';
import styles from './page.module.css';

export default function LivePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
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
      const data = await fetchXtream(acc.server, acc.username, acc.password, 'get_live_categories');
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].category_id);
          loadChannels(acc, data[0].category_id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async (acc, categoryId) => {
    setLoadingChannels(true);
    setChannels([]);
    try {
      const data = await fetchXtream(acc.server, acc.username, acc.password, 'get_live_streams', { category_id: categoryId });
      if (Array.isArray(data)) {
        setChannels(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    loadChannels(account, id);
  };

  const handleChannelClick = (channel) => {
    router.push(`/player?id=${channel.stream_id}&type=live&name=${encodeURIComponent(channel.name)}`);
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
        {loadingChannels ? (
          <div>Loading Channels...</div>
        ) : (
          <div className={styles.grid}>
            {channels.map(channel => (
              <div key={channel.stream_id} className={styles.card} onClick={() => handleChannelClick(channel)}>
                {channel.stream_icon ? (
                  <img 
                    src={channel.stream_icon} 
                    alt={channel.name} 
                    className={styles.cover} 
                    loading="lazy" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                ) : (
                  <div className={styles.cover} />
                )}
                <div className={styles.title}>{channel.name}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
