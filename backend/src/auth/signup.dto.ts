import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class signUpDto {
  //name
  @IsNotEmpty({
    message: 'nameの入力は必須です',
  })
  name: string;

  //email
  @IsEmail(
    {},
    {
      message: '無効なEmailです',
    },
  )
  email: string;

  //display_id
  @IsNotEmpty({
    message: 'IDの入力は必須です',
  })
  @MaxLength(10, {
    message: 'IDは10文字以下でお願いします',
  })
  @Matches(/^[a-z_0-9]+$/i, {
    message: 'IDに使える文字は 英・数字・_ のみです',
  })
  display_id: string;

  //password
  @IsNotEmpty({
    message: 'パスワードの入力は必須です',
  })
  @MinLength(4, {
    message: 'パスワードは4文字以上でお願いします',
  })
  password: string;
}
