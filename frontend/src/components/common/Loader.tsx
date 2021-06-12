import React, { useState, useEffect } from 'react';

import styles from './Loader.module.scss';

const Loader: React.FC = () => {
  const [RandomInt, setRandomInt] = useState<string>();
  const [RandomString, setRandomString] = useState<string>();

  const generateRand = () => {
    setRandomInt(new String(Math.floor(Math.random() * 1000000)) + '...');
    setRandomString(
      Math.random().toString(16).substring(2) + Math.random().toString(16).substring(4),
    );
    //console.log('generate rand');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      generateRand();
    }, 200);

    return function cleanUp() {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className={styles.loader}>
        <div className={styles['loader-wrap']}>
          <p className={styles['loader-comment1']}>Loading Data {RandomInt}</p>
          <p className={styles['loader-comment2']}> {RandomString}</p>
        </div>
        <div className="loading-ui-elemnt">
          <div className={styles['half-circle-spinner']}>
            <div className={`${styles.circle} ${styles.circle1}`}></div>
            <div className={`${styles.circle} ${styles.circle2}`}></div>
          </div>
          <div className={styles['loading-bar']}>
            <div className={styles['loading-bar-inner']}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loader;
