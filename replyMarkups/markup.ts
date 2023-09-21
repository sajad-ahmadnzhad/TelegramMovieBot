let movieModel = require("../models/movieModel");
let startBot = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "فیلمهای هالیوود", callback_data: "HollywoodMovie" },
        { text: "فیلمهای بالیوود", callback_data: "BollywoodMovie" },
      ],
      [
        { text: "فیلمهای ایرانی", callback_data: "IranianMovie" },
        { text: "فیلمهای ترکی", callback_data: "TurkishMovie" },
      ],
    ],
  },
};

let genreMovie = (Industry: string = "") => {
  let data = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "اکشن", callback_data: `${Industry} Action` },
          { text: "عاشقانه", callback_data: `${Industry} Romantic` },
          { text: "کمدی", callback_data: `${Industry} Comedy` },
        ],
        [
          { text: "ترسناک", callback_data: `${Industry} Scary` },
          { text: "بیوگرافی", callback_data: `${Industry} Biography` },
          { text: "درام", callback_data: `${Industry} Drama` },
        ],[
            { text: "برگشت", callback_data: `backToListIndustrys` },
        ]
      ],
    },
  };

  return data;
};

module.exports = { startBot, genreMovie };
