const unescapeHtml = function (target: string) {
  if (typeof target !== 'string') return target;

  const patterns: { [s: string]: string } = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x60;': '`',
  };

  return target.replace(/&(lt|gt|amp|quot|#x27|#x60);/g, function (match) {
    return patterns[match];
  });
};

export default unescapeHtml;
//https://qiita.com/hrdaya/items/291276a5a20971592216
