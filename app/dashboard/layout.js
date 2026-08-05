"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Tv, Film, PlaySquare, LogOut, User, Search } from 'lucide-react';
import { t } from '@/utils/lang';
import styles from './layout.module.css';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [account, setAccount] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('active_account');
    if (saved) {
      setAccount(JSON.parse(saved));
    } else {
      router.push('/');
    }
    setMounted(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('active_account');
    router.push('/');
  };

  if (!mounted || !account) return null;

  const navItems = [
    { name: t.home, path: '/dashboard', icon: Home },
    { name: t.liveTv, path: '/dashboard/live', icon: Tv },
    { name: t.movies, path: '/dashboard/movies', icon: Film },
    { name: t.series, path: '/dashboard/series', icon: PlaySquare },
    { name: t.search, path: '/dashboard/search', icon: Search },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>XTREAM</div>
        
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            <User size={20} color="#B3B3B3" />
          </div>
          <div className={styles.userName}>{account.name || account.username}</div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => (
            <Link key={item.path} href={item.path}>
              <div className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}>
                <item.icon size={20} />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className={`${styles.navItem} ${styles.logout}`}>
          <LogOut size={20} />
          Switch Profile
        </button>
      </aside>
      
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
