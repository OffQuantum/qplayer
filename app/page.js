"use client";

import { useState, useEffect } from 'react';
import { fetchXtream } from '@/utils/xtream';
import { PlusCircle, User, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { t } from '@/utils/lang';
import styles from './page.module.css';

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('xtream_accounts');
    if (saved) {
      setAccounts(JSON.parse(saved));
    }
  }, []);

  const saveAccounts = (newAccounts) => {
    setAccounts(newAccounts);
    localStorage.setItem('xtream_accounts', JSON.stringify(newAccounts));
  };

  const [formData, setFormData] = useState({
    name: '',
    server: '',
    username: '',
    password: ''
  });

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await fetchXtream(formData.server, formData.username, formData.password);
      if (data && data.user_info && data.user_info.auth === 1) {
        const newAccount = {
          id: Date.now().toString(),
          name: formData.name || data.user_info.username,
          server: formData.server,
          username: formData.username,
          password: formData.password,
          status: data.user_info.status,
          exp_date: data.user_info.exp_date
        };
        saveAccounts([...accounts, newAccount]);
        setIsAdding(false);
        setFormData({ name: '', server: '', username: '', password: '' });
      } else {
        setError(t.invalidCreds);
      }
    } catch (err) {
      setError(t.invalidCreds);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (account) => {
    localStorage.setItem('active_account', JSON.stringify(account));
    router.push('/dashboard');
  };

  const handleDeleteAccount = (e, id) => {
    e.stopPropagation();
    saveAccounts(accounts.filter(a => a.id !== id));
  };

  if (isAdding) {
    return (
      <div className={styles.container}>
        <div className={`glass-panel ${styles.formContainer}`}>
          <h1 className={styles.formTitle}>{t.addAccount}</h1>
          {error && <div className={styles.error}>{error}</div>}
          <form onSubmit={handleAddAccount} className="flex flex-col">
            <input
              type="text"
              placeholder={t.profileName}
              className="input-field"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <input
              type="url"
              required
              placeholder={t.serverUrl}
              className="input-field"
              value={formData.server}
              onChange={e => setFormData({...formData, server: e.target.value})}
            />
            <input
              type="text"
              required
              placeholder={t.username}
              className="input-field"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
            <input
              type="password"
              required
              placeholder={t.password}
              className="input-field"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <div className={styles.formActions}>
              <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>{t.cancel}</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t.connecting : t.addAccountBtn}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.whosWatching}</h1>
      <div className={styles.profilesGrid}>
        {accounts.map(account => (
          <div key={account.id} className={styles.profileCard} onClick={() => handleSelectAccount(account)}>
            <div className={styles.avatar}>
              <User size={64} color="#B3B3B3" />
              <button 
                onClick={(e) => handleDeleteAccount(e, account.id)}
                className={styles.deleteBtn}
                title="Delete Profile"
              >
                <Trash2 size={20} color="white" />
              </button>
            </div>
            <span className={styles.profileName}>{account.name}</span>
          </div>
        ))}
        
        <div className={`${styles.profileCard} ${styles.addProfile}`} onClick={() => setIsAdding(true)}>
          <div className={styles.avatar}>
            <PlusCircle size={64} color="#B3B3B3" />
          </div>
          <span className={styles.profileName}>{t.addProfile}</span>
        </div>
      </div>
    </div>
  );
}
