import React from 'react';
import Link from 'next/link';
import withAuth from '../components/withAuth';
import styles from '../styles/Home.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to StatDash</h1>
      <div className={styles.buttonContainer}>
        <Link href="/azureServerHealth" passHref>
          <button className={styles.button}>Go to Server Metrics</button>
        </Link>
        <Link href="/merakiMetrics" passHref>
          <button className={styles.button}>Go to Network Metrics</button>
        </Link>
      </div>
    </div>
  );
};

export default withAuth(Home);
