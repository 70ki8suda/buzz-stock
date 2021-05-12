function format_date(_input) {
  let tempDate = new Date(_input);

  let year = tempDate.getFullYear();
  let month = tempDate.getMonth() + 1;
  let day = tempDate.getDate();
  let hours = tempDate.getHours();
  let minutes = tempDate.getMinutes();

  var diff = new Date().getTime() - tempDate.getTime();
  var elapsed = new Date(diff);

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
