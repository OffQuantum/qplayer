"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Turnstile } from "@marsidev/react-turnstile";
import { verifyTurnstileToken } from "./actions";
import styles from "../../page.module.css";
import { LogIn } from "lucide-react";

export default function SignInPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("pending"); // pending, solved, error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerify = async (t) => {
    setToken(t);
    setStatus("solved");
    setErrorMsg("");
  };

  const handleError = () => {
    setStatus("error");
    setErrorMsg("Güvenlik doğrulaması başarısız oldu. Lütfen sayfayı yenileyin.");
  };

  const handleLogin = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await verifyTurnstileToken(token);
      if (res.success) {
        await signIn("google", { callbackUrl: "/" });
      } else {
        setErrorMsg(res.error || "Doğrulama başarısız.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Giriş yapılırken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.formContainer}`} style={{ textAlign: 'center' }}>
        <h1 className={styles.formTitle}>Uygulamaya Giriş</h1>
        
        <p style={{ color: '#B3B3B3', marginBottom: '1.5rem' }}>
          Devam etmek için lütfen robot olmadığınızı doğrulayın.
        </p>

        <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
          <Turnstile 
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
            onSuccess={handleVerify}
            onError={handleError}
            onExpire={() => setStatus("pending")}
          />
        </div>

        {errorMsg && <div style={{ color: '#ff4d4f', marginBottom: '1rem' }}>{errorMsg}</div>}

        <button 
          onClick={handleLogin}
          disabled={status !== "solved" || loading}
          style={{
            backgroundColor: status === "solved" && !loading ? 'white' : '#333',
            color: status === "solved" && !loading ? 'black' : '#888',
            padding: '12px 24px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: 'none',
            cursor: status === "solved" && !loading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            transition: 'all 0.2s'
          }}
        >
          <LogIn size={20} />
          {loading ? "Doğrulanıyor..." : "Google ile Giriş Yap"}
        </button>
      </div>
    </div>
  );
}
