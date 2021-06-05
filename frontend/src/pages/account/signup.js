import React, { useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

//components
//utils
import auth from '../../utils/auth';
//style
import authStyle from '../../styles/pages/Auth.module.scss';
//context
import { LoggedInContext } from '../_app';
import { AuthUserContext } from '../_app';
const Signup = () => {
  const { setLoggedInState } = useContext(LoggedInContext);
  const { authUserData } = useContext(AuthUserContext);
  const router = useRouter();
  const [data, setData] = React.useState({
    name: '',
    display_id: '',
    email: '',
    password: '',
  });

  const [messages, setMessages] = React.useState({
    name: '',
    display_id: '',
    email: '',
    password: '',
  });

  const [serverResponse, setServerResponse] = React.useState([]);

  const handleInputChange = (e) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    setData(() => {
      return { ...data, [name]: value };
    });
    setMessages(() => {
      return { ...messages, [name]: formValidate(name, value) };
    });
  };

  const formValidate = (name, value) => {
    switch (name) {
      case 'name':
        return nameValidation(value);
      case 'display_id':
        return idValidation(value);
      case 'email':
        return emailValidation(value);
      case 'password':
        return passwordValidation(value);
    }
  };
  const nameValidation = (name) => {
    if (!name) return 'nameを入力してください';
    return '';
  };

  const idValidation = (id) => {
    if (!id) return 'idを入力してください';
    if (id.length > 20) return 'IDは20文字以下でお願いします';
    const regex = /^[a-z_0-9]+$/i;
    if (!regex.test(id)) return 'IDに使える文字は 英・数字・_ のみです';

    return '';
  };

  const emailValidation = (email) => {
    if (!email) return 'メールアドレスを入力してください';

    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regex.test(email)) return '正しい形式でメールアドレスを入力してください';

    return '';
  };

  const passwordValidation = (password) => {
    if (!password) return 'passwordを入力してください';
    if (password.length < 4) return 'パスワードは4文字以上でお願いします';
    return '';
  };

  // 3. handleSignUpメソッドの定義
  async function handleSignUp(e) {
    e.preventDefault();

    const { name, display_id, email, password } = data;
    let siguUpSuccess = false;
    let formData = new FormData();
    formData.append('name', name);
    formData.append('display_id', display_id);
    formData.append('email', email);
    formData.append('password', password);
    const baseRequestUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;
    const signup_api_path = baseRequestUrl + '/auth/signup';

    const requestOptions = {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        Authorization: auth.bearerToken(),
      },
      body: formData,
    };

    //ユーザーデータ作成
    await fetch(signup_api_path, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (!data.error) {
          siguUpSuccess = true;
        } else {
          setServerResponse([]);
          if (typeof data.message == 'string') {
            setServerResponse([data.message]);
          } else {
            setServerResponse(data.message);
          }
          console.log(serverResponse);
        }
        console.log(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    //そのあと自動でtoken発行してログイン処理
    if (siguUpSuccess) {
      const login_api_path = baseRequestUrl + '/auth/signin';
      let formData2 = new FormData();
      formData2.append('email', email);
      formData2.append('password', password);
      const loginApi = await fetch(login_api_path, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        body: formData2,
      }).catch((error) => {
        console.error('Error:', error);
      });

      const result = await loginApi.json();
      auth.login(result);

      setLoggedInState(auth.isAuthenticated());
      //console.log(authUserData);
      let userId = result.userId;
      router.push(`/user/${userId}`);
    }
  }

  return (
    <>
      <Head>
        <title>Buzz Stock .com | Sign Up</title>
      </Head>
      <div className={authStyle['auth-wrap']}>
        <h2 className={authStyle['auth-title']}>Sign Up</h2>
        <div className={authStyle['server-response-container']}>
          {serverResponse.map((message, index) => (
            <p className={authStyle['server-response']} key={index}>
              {message}
            </p>
          ))}
        </div>
        <div className={authStyle['form-container']}>
          <form className={authStyle['form']}>
            <div className="form-item">
              <label htmlFor="name">
                名前<span className={authStyle['validation-message']}>{messages.name}</span>
              </label>
              <input
                type="text"
                placeholder="name"
                name="name"
                value={data.name}
                onChange={handleInputChange}
                className={authStyle['text-input']}
              />
            </div>
            <div className="form-item">
              <label htmlFor="name">
                ユーザーID (英・数字・_ )
                <span className={authStyle['validation-message']}>{messages.display_id}</span>
              </label>
              <input
                required={true}
                type="text"
                placeholder="ID"
                name="display_id"
                value={data.display_id}
                onChange={handleInputChange}
                className={authStyle['text-input']}
              />
            </div>
            <div className="form-item">
              <label htmlFor="name">
                メールアドレス
                <span className={authStyle['validation-message']}>{messages.email}</span>
              </label>
              <input
                type="text"
                required={true}
                placeholder="email address"
                name="email"
                value={data.email}
                onChange={handleInputChange}
                className={authStyle['text-input']}
              />
            </div>
            <div className="form-item">
              <label htmlFor="name">
                パスワード
                <span className={authStyle['validation-message']}>{messages.password}</span>
              </label>
              <input
                type="password"
                required={true}
                placeholder="password"
                name="password"
                onChange={handleInputChange}
                className={authStyle['text-input']}
              />
            </div>

            <button className={authStyle['auth-submit']} onClick={(e) => handleSignUp(e)}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
