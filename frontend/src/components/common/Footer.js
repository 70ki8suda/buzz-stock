import React from 'react';
import style from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={style['wrap']}>
      <div className={style['yarn left']}>
        <p className={style['data-source']}>
          <a
            href="https://api.rakuten.net/apidojo/api/yahoo-finance1/details"
            target="_blank"
            rel="noreferrer"
          >
            Data Source: Yahoo Finance API
          </a>
        </p>
        <div>
          Icons made by{' '}
          <a href="https://www.flaticon.com/authors/those-icons" title="Those Icons">
            Those Icons
          </a>{' '}
          from{' '}
          <a href="https://www.flaticon.com/" title="Flaticon">
            www.flaticon.com
          </a>
        </div>
        <div>
          Icons made by{' '}
          <a href="https://icon54.com/" title="Pixel perfect">
            Pixel perfect
          </a>{' '}
          from{' '}
          <a href="https://www.flaticon.com/" title="Flaticon">
            www.flaticon.com
          </a>
        </div>
        <div>
          Icons made by{' '}
          <a href="https://www.freepik.com" title="Freepik">
            Freepik
          </a>{' '}
          from{' '}
          <a href="https://www.flaticon.com/" title="Flaticon">
            www.flaticon.com
          </a>
        </div>
      </div>
      <p className={style['copy']}>
        &copy;
        <a href="https://github.com/70ki8suda" target="_blank" rel="noreferrer">
          70ki8suda
        </a>{' '}
        ALL RIGHTS RESERVED.
      </p>
    </footer>
  );
};

export default Footer;
