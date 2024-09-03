import React, { useState } from 'react';
import styles from '../styles/Header.module.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/Senderra_Logo.png" alt="Senderra Logo" />
      </div>
      <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/azureServerHealth">Server Health</a></li>
          <li><a href="/network">Network Health</a></li>
          <li><a href="/documents">Documents</a></li>
          <li><a href="/helpdesk">HelpDesk</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
      <div className={styles.hamburger} onClick={toggleMenu}>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </div>
    </header>
  );
};

export default Header;
