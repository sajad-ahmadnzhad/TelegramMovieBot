let messageStartBot = (first_name: string): string => {
  return `سلام ${first_name} به ربات فیلم پرداز خوش آمدید\n
این ربات به بهت کمک میکنه که فیلمهای مورد نظرت رو پیدا کنی و از دیدن شون لذت ببری\n
به چه فیلمهایی علاقه داری👇`;
};

let messageErrorQuality = (qualitys: string[]) => {
  return `
کیفیت این فیلم معتبر نیست باید: ${qualitys.join(" ")} یکی از این سه کیفیت باشد 
درضمن بررسی کنید که در کپشن فیلم "کیفیت:" وجود دارد یا 
خیر`;
};

let messageErrorLanguage = (languages: string[]) => {
  return `
زبان وارد شده معتبر نیست زبان فیلم باید شامل: ${languages.join(" ")} یکی از این دو مورد باشد
درضمن چک کنید که آیا کلمه ای به نام "زبان" در کپشن فیلم وجود دارد یا خیر`;
};

module.exports = { messageStartBot, messageErrorQuality, messageErrorLanguage };
