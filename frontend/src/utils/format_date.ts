function format_date(_input: Date) {
  const tempDate = new Date(_input);

  const year = tempDate.getFullYear();
  const month = tempDate.getMonth() + 1;
  const day = tempDate.getDate();
  const hours = tempDate.getHours();
  const minutes = tempDate.getMinutes();

  const diff = new Date().getTime() - tempDate.getTime();
  const elapsed = new Date(diff);

  if (elapsed.getUTCFullYear() - 1970) {
    return year + '年' + month + '月' + day + '日' + hours + '時' + minutes + '分';
  } else if (elapsed.getUTCMonth()) {
    return month + '月' + day + '日' + hours + '時' + minutes + '分';
  } else if (elapsed.getUTCDate() - 1) {
    return elapsed.getUTCDate() - 1 + '日前';
  } else if (elapsed.getUTCHours()) {
    return elapsed.getUTCHours() + '時間前';
  } else if (elapsed.getUTCMinutes()) {
    return elapsed.getUTCMinutes() + '分前';
  } else {
    return elapsed.getUTCSeconds() + '秒前';
  }
}

export default format_date;
