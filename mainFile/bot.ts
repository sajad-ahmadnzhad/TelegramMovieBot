import TelegramBot from "node-telegram-bot-api";
require("../config/db");
require("dotenv").config();
let {
  messageStartBot,
  messageErrorQuality,
  messageErrorLanguage,
} = require("../messagesBot/message");
let {
  startBot,
  genreMovie,
  sendMovieOption,
} = require("../replyMarkups/markup");
let { movies } = require("../models/movieModel");
let { videoMovies } = require("../models/sendMovie");
let token =
  (process.env.BOT_TOKEN as string) ||
  "6475062422:AAHuBVOZqgUdQNj_Tu0NpHpLhXNj53Xgang";
class StartBot {
  protected bot: TelegramBot;
  constructor(protected token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.cllbackQueryHandler();
  }

  get id(): number {
    return this.id
  }

  set id(id: number) {
    this.id = id
  }

  sendMessage(): void {
    this.bot.onText(/\/start/, async (msg) => {
      let id = msg.from!.id;
      this.bot.sendMessage(id, messageStartBot(msg.from?.first_name), startBot);
    });
  }

  cllbackQueryHandler() {
    this.bot.on("callback_query", async (msg) => {
      let data = msg.data;
      let id = msg.from.id;
      this.bot.answerCallbackQuery(msg.id);

      let resultMarkup;
      if (typeof startBot.reply_markup == "string")
        resultMarkup = JSON.parse(startBot.reply_markup).inline_keyboard;
      else resultMarkup = startBot.reply_markup.inline_keyboard;

      let message = "ژانر مورد نظر را انتخاب نمایید";
      resultMarkup.flat(Infinity).forEach((item: { callback_data: string }) => {
        if (data == item.callback_data) {
          this.bot.editMessageText(message, {
            reply_markup: genreMovie(data).reply_markup,
            chat_id: id,
            message_id: msg.message?.message_id,
          });
        }
      });

      if (data == "backToListIndustrys") {
        this.bot.editMessageText(messageStartBot(msg.from.first_name), {
          reply_markup: startBot.reply_markup,
          chat_id: id,
          message_id: msg.message?.message_id,
        });
      }
    });
  }
}

class AdminMessage extends StartBot {
  constructor(token: string) {
    super(token);
    this.sendMessage();
  }
  getPhotoMovie(): void {
    this.bot.on("photo", async (msg) => {
      let id = msg.from!.id;
      if (id == 1088935787 && msg.caption) {
        let industry = ["bollywood", "hollywood", "tranian", "turkish"];
        let movieIndustry = industry.find((item) =>
          msg.caption?.includes(item)
        );

        if (movieIndustry) {
          let regexMovieName = /Name Movie: (.+)/;
          let matchMovie = msg.caption!.match(regexMovieName);
          if (!matchMovie)
            return this.bot.sendMessage(id, "invalid name movie");
          let movieName = matchMovie![1];

          if (!movieName || movieName.length < 4)
            return this.bot.sendMessage(id, "نام فیلم معتبر نیست");

          let regexGenre = /ژانر: (.+)/;
          let matchGenre = msg.caption!.match(regexGenre);
          let movieGenre = matchGenre![1];
          let checkNameMovie = await movies.findOne({ movieName });
          if (checkNameMovie) {
            let message = "این فیلم از قبل در دیتابیس قرار دارد";
            return this.bot.sendMessage(id, message);
          }

          let regexLinkDownload = /linkDownload: (.+)/;
          let matchLink = msg.caption!.match(regexLinkDownload);
          let message = "ادمین عزیز لطفا لینک دانلود را اضافه کنید";
          if (!matchLink) return this.bot.sendMessage(id, message);
          let movieLinkDownload = matchLink![1];
          msg.caption = msg.caption.replace(/linkDownload:.*/g, "");

          await movies.create({
            movieName,
            movieGenre,
            moviePhoto: msg.photo![0].file_id,
            movieCaption: msg.caption,
            movieIndustry,
            movieLinkDownload,
          });
          let messageCreatedTODB = `فیلم ${movieName} با موفقیت در دیتابیس قرار گرفت`;
          this.bot.sendMessage(id, messageCreatedTODB);
        }
      }
    });
  }

  getVideoMovie() {
    this.bot.on("video", async (msg) => {
      let id = msg.from?.id as number;

      if (id == 1088935787 && msg.caption) {
        let movieCaption = msg.caption;
        let movieId = msg.video?.file_id;

        let regexMovieName = /Name Movie: (.+)/;
        let matchMovieName = msg.caption?.match(regexMovieName);
        let movieName = matchMovieName![1].trim();
        if (!matchMovieName)
          return this.bot.sendMessage(id, "نام این فیلم معتبر نیست", {
            reply_to_message_id: msg.message_id,
          });

        let qualitys = ["480p", "720p", "1080p"];
        let regexMovieQuality = /کیفیت: (.+)/;
        let matchMovieQuality = msg.caption?.match(regexMovieQuality);
        let includesQua = qualitys.includes(matchMovieQuality![1].trim());
        let movieQuality = matchMovieQuality![1].trim();
        if (!matchMovieQuality || !includesQua)
          return this.bot.sendMessage(id, messageErrorQuality(qualitys), {
            reply_to_message_id: msg.message_id,
          });

        let languages = ["#دوبله_فارسی", "#زیرنویس_چسبیده_فارسی"];
        let regexMovieLanguage = /زبان: (.+)/;
        let matchMovieLanguage = msg.caption?.match(regexMovieLanguage);
        let movieLanguage = matchMovieLanguage![1]?.trim();
        let includesLang = languages.includes(matchMovieLanguage![1].trim());

        if (!matchMovieLanguage || !includesLang) {
          return this.bot.sendMessage(id, messageErrorLanguage(languages), {
            reply_to_message_id: msg.message_id,
          });
        }

        let findData = await videoMovies.findOne({
          movieName,
          movieLanguage,
          movieQuality,
        });

        if (findData) {
          let message = "این فیلم از قبل در دیتابیس وجود دارد";
          return this.bot.sendMessage(id, message, {
            reply_to_message_id: msg.message_id,
          });
        }

        await videoMovies.create({
          movieName,
          movieLanguage,
          movieQuality,
          movieCaption,
          movieId,
        });

        this.bot.sendMessage(id, "با موفقیت در دیتابیس ذخیره شد", {
          reply_to_message_id: msg.message_id,
        });
      }
    });
  }
}

class SendMovie extends AdminMessage {
  constructor(token: string) {
    super(token);
    this.getPhotoMovie();
    this.getVideoMovie();
  }

  sendMovieData(): void {
    this.bot.on("callback_query", async (msg) => {
      let id = msg.from!.id;
      let data = msg.data;
      let findMovie = await movies.findOne({ movieName: data });

      if (findMovie) {
        this.bot.sendPhoto(
          id,
          findMovie.moviePhoto,
          await sendMovieOption(findMovie)
        );
      }

      let splitData = data?.split(" ");
      if (splitData?.length == 2) {
        let findData = await movies.find({
          movieIndustry: splitData![0].toLocaleLowerCase(),
        });

        if (!findData.length) return;
        let inline_keyboard = [
          [{ text: "بستن", callback_data: "closeListMovie" }],
        ];
        let row = [];

        for (const item of findData) {
          if (item.movieGenre.includes(splitData![1])) {
            row.push({ text: item.movieName, callback_data: item.movieName });
            if (row.length == 2) {
              inline_keyboard.unshift(row);
              row = [];
            }
          }
        }

        if (row.length == 1) inline_keyboard.unshift(row);
        else if (inline_keyboard.length == 1)
          return this.bot.sendMessage(id, "فیلمی قرار گرفته نشده");

        let message = `فیلمهایی با ژانر ${splitData[1]}:`;
        this.bot.sendMessage(id, message, {
          reply_markup: { inline_keyboard },
        });
      }
      if (data == "closeMovie" || data == "closeListMovie") {
        this.bot.deleteMessage(id, msg.message?.message_id as number);
      }
    });
  }
}

let sendMovie = new SendMovie(token);

sendMovie.sendMovieData();