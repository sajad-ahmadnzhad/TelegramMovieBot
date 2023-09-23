let movieModel = require("../models/movieModel");
let startBot = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "فیلمهای هالیوود", callback_data: "Hollywood" },
        { text: "فیلمهای بالیوود", callback_data: "Bollywood" },
      ],
      [
        { text: "فیلمهای ایرانی", callback_data: "Iranian" },
        { text: "فیلمهای ترکی", callback_data: "Turkish" },
      ],
    ],
  },
};

let genreMovie = (Industry: string = "") => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "اکشن", callback_data: `${Industry} اکشن` },
          { text: "عاشقانه", callback_data: `${Industry} عاشقانه` },
          { text: "کمدی", callback_data: `${Industry} کمدی` },
        ],
        [
          { text: "ترسناک", callback_data: `${Industry} ترسناک` },
          { text: "بیوگرافی", callback_data: `${Industry} بیوگرافی` },
          { text: "درام", callback_data: `${Industry} درام` },
        ],
        [{ text: "برگشت", callback_data: `backToListIndustrys` }],
      ],
    },
  };
};

interface PropertyMovie {
  movieCaption: string;
  movieLinkDownload: string;
}

let sendMovieOption = (findMovie: PropertyMovie) => {
  return {
    caption: findMovie.movieCaption,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "دانلود فیلم", url: findMovie.movieLinkDownload },
          { text: "بستن", callback_data: "closeMovie" },
        ],
      ],
    },
  };
};

module.exports = { startBot, genreMovie , sendMovieOption };
