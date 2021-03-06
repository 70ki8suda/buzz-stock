import { IsNotEmpty } from 'class-validator';
export class logInDto {
  @IsNotEmpty({
    message: 'メールアドレスの入力は必須です',
  })
  email: string;

  @IsNotEmpty({
    message: 'パスワードの入力は必須です',
  })
  password: string;
}
