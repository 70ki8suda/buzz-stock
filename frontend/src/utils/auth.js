import Cookies from 'js-cookie';

const Authentication = {
  removeCookie() {
    Cookies.remove('expires');
    Cookies.remove('jwt');
  },

  // 有効期限内の場合はtrueを返す
  isAuthenticated() {
    return new Date().getTime() < Cookies.get('expires');
  },
  // ログイン業務
  login({ expires }) {
    Cookies.set('expires', expires);
  },

  // ログアウト業務
  logout() {
    const requestOptions = {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
    };
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const api_url = baseRequestUrl + '/auth/logout';
    fetch(api_url, requestOptions);
    this.removeCookie();
  },
};

export default Authentication;
