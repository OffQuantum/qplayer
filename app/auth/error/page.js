"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import styles from "../../page.module.css";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.formContainer}`} style={{ textAlign: 'center' }}>
        <h1 className={styles.formTitle} style={{ color: '#f40612' }}>Erişim Reddedildi</h1>
        <div style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#B3B3B3' }}>
          {error === 'AccessDenied' 
            ? "Bu Google hesabının uygulamaya erişim izni yok. Lütfen yetkili bir hesapla tekrar giriş yapmayı deneyin."
            : "Giriş yaparken bir hata oluştu."}
        </div>
        <Link href="/" style={{
          backgroundColor: 'white',
          color: 'black',
          padding: '12px 24px',
          borderRadius: '4px',
          fontWeight: 'bold',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Giriş Ekranına Dön
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.title}>Yükleniyor...</div></div>}>
      <ErrorContent />
    </Suspense>
  );
}
