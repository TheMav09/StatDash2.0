import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { loginRequest } from '../config/auth';
import styles from '../styles/Login.module.css'; 

const Login = () => {
  const { instance, accounts } = useMsal();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      router.push('/'); // Redirect to the home page if already logged in
    }
  }, [accounts, router, instance]);

  const handleLogin = () => {
    setLoading(true);
    setError(''); // Reset error before attempting login
    instance.loginPopup(loginRequest)
      .then(() => {
        router.push('/'); // Redirect to the home page after login
      })
      .catch((error) => {
        console.error('Login failed:', error);
        setLoading(false);
        setError('Login failed. Please try again.');
      });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.loginText}>Please log in</h1>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button onClick={handleLogin} className={styles.loginButton} disabled={loading}>
          {loading ? 'Logging in...' : 'Log in with Azure AD'}
        </button>
      </div>
    </div>
  );
};

export default Login;
