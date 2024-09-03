// pages/_app.js
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '../config/auth';
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function MyApp({ Component, pageProps }) {
  return (
    <MsalProvider instance={msalInstance}>
      <Header />
      <main style={{ paddingTop: '60px', paddingBottom: '40px' }}>
        <Component {...pageProps} />
      </main>
      <Footer />
    </MsalProvider>
  );
}

export default MyApp;
