"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllProgress } from '@/utils/progress';
import { t } from '@/utils/lang';
import styles from './page.module.css';

export default function DashboardHome() {
  const router = useRouter();
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    const progressObj = getAllProgress();
    const items = Object.values(progressObj).sort((a, b) => b.updatedAt - a.updatedAt);
    setRecentItems(items);
  }, []);

  const handlePlay = (item) => {
    router.push(`/player?id=${item.streamId}&type=${item.type}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{t.welcomeBack}</h1>
      
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.continueWatching}</h2>
        {recentItems.length > 0 ? (
          <div className={styles.grid}>
            {recentItems.map((item) => (
              <div key={item.streamId} className={styles.card} onClick={() => handlePlay(item)}>
                {item.metadata?.cover ? (
                  <img src={item.metadata.cover} alt={item.metadata.name} className={styles.cover} />
                ) : (
                  <div className={styles.cover} /> // Placeholder
                )}
                <div className={styles.typeBadge}>{item.type}</div>
                <div className={styles.info}>
                  <div className={styles.title}>{item.metadata?.name || 'Unknown'}</div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>
            {t.noContinueWatching}
          </div>
        )}
      </section>

      {/* Featured or Categories could go here */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.quickLinks}</h2>
        <div className={styles.grid}>
          <div className={styles.card} onClick={() => router.push('/dashboard/live')}>
            <div className={styles.info}>
              <div className={styles.title}>{t.watchLiveTv}</div>
            </div>
          </div>
          <div className={styles.card} onClick={() => router.push('/dashboard/movies')}>
            <div className={styles.info}>
              <div className={styles.title}>{t.browseMovies}</div>
            </div>
          </div>
          <div className={styles.card} onClick={() => router.push('/dashboard/series')}>
            <div className={styles.info}>
              <div className={styles.title}>{t.browseSeries}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
