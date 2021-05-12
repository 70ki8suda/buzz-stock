import Cookies from 'js-cookie';
import crypto from 'crypto';

const Authentication = {
  removeCookie() {
    Cookies.remove('exp');
    Cookies.remove('id');
  },

  // 有効期限内の場合はtrueを返す
  isAuthenticated() {
    return new Date().getTime() < Cookies.get('exp') * 1000;
  },
  // ログイン業務
  login({ exp, user, id }) {
    Cookies.set('exp', exp);
    Cookies.set('id', id);
  },
  decrypt_userID(encryptedID) {
    const algorithm = 'aes-256-cbc';
    const key = process.env.NEXT_PUBLIC_ENCRYPT_KEY;
    const iv = process.env.NEXT_PUBLIC_ENCRYPT_IV;
    var cipher = crypto.createDecipheriv(algorithm, key, iv);
    var decrypted = cipher.update(encryptedID, 'base64', 'utf-8');
    decrypted += cipher.final('utf-8');
    return decrypted;
  },
  loggedin_userID() {
    const encryptedID = Cookies.get('id');
    const loggedin_user_id = this.decrypt_userID(encryptedID);
    return loggedin_user_id;
  },
  // ログアウト業務
  logout() {
    const requestOptions = {
      method: 'DELETE',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    };
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const api_url = baseRequestUrl + '/api/v1/user_token';
    fetch(api_url, requestOptions);
    this.removeCookie();
    window.location.href = '/';
  },
};

export default Authentication;
