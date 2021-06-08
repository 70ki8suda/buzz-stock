import Cookies from 'js-cookie';

const Authentication = {
  removeCookie() {
    Cookies.remove('expires');
    Cookies.remove('jwt');
  },

  // 有効期限内の場合はtrueを返す
  isAuthenticated() {
    return new Date().getTime() < parseInt(Cookies.get('expires')!);
  },
  // ログイン業務
  login({ expires, jwt }: { expires: string; jwt: string }) {
    Cookies.set('expires', expires);
    Cookies.set('jwt', jwt);
  },

  //BearerToken
  bearerToken() {
    const jwt = Cookies.get('jwt');
    return 'Bearer ' + jwt;
  },

  // ログアウト業務
  logout() {
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const api_url = baseRequestUrl + '/auth/logout';
    fetch(api_url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
    });
    this.removeCookie();
  },
};

export default Authentication;
