import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TweetInputDto {
  @IsString()
  @IsNotEmpty({
    message: 'tweetを入力してください。',
  })
  @MaxLength(240, {
    message: 'tweetは240文字以下でお願いします',
  })
  content: string;
  tickers: string;
}
