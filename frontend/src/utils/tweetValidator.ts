const TweetValidator = {
  validate(name: string, value: string) {
    switch (name) {
      case 'tweet_text':
        return this.tweetTextValidation(value);
    }
  },

  tweetTextValidation(text: string) {
    //console.log(text);
    if (!text) return 'tweetを入力してください';
    if (text.length > 240) return 'tweetは240文字以下でお願いします';
    return '';
  },
};

export default TweetValidator;
