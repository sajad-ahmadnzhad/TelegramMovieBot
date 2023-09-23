import TelegramBot from "node-telegram-bot-api";
require("../config/db");
require("dotenv").config();
let { messageStartBot } = require("../messagesBot/message");
let {
  startBot,
  genreMovie,
  sendMovieOption,
} = require("../replyMarkups/markup");
let { movies } = require("../models/movieModel");
let token =
  (process.env.BOT_TOKEN as string) ||
  "6475062422:AAHuBVOZqgUdQNj_Tu0NpHpLhXNj53Xgang";
class StartBot {
  protected bot: TelegramBot;
  constructor(protected token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.cllbackQueryHandler();
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
  messageAdminHandler() {
    this.bot.on("message", async (msg) => {
      let id = msg.from!.id;
      if (id == 1088935787 && msg.photo && msg.caption) {
        let industry = ["bollywood", "hollywood"];
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
            moviePhoto: msg.photo[0].file_id,
            movieCaption: msg.caption,
            movieIndustry,
            movieLinkDownload,
          });
          let messageCreatedTODB = `فیلم ${movieName} با موفقیت در دیتابیس قرار گرفت`;
          this.bot.sendMessage(id, messageCreatedTODB);
        } else {
          this.bot.sendMessage(id, "کپشن معتبر نیست");
        }
      }
    });
  }
}

class SendMovie extends AdminMessage {
  constructor(token: string) {
    super(token);
    this.messageAdminHandler();
  }

  sendMovieData(): void {
    this.bot.on("callback_query", async (msg) => {
      let id = msg.from!.id;
      let data = msg.data;

      let findMovie = await movies.findOne({ movieName: data });
      if (findMovie)
        this.bot.sendPhoto(
          id,
          findMovie.moviePhoto,
          sendMovieOption(findMovie)
        );

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
          reply_markup: { inline_keyboard: inline_keyboard },
        });
      }
      if (data == "closeMovie" || data == "closeListMovie") {
        this.bot.deleteMessage(id, msg.message?.message_id!);
      }
    });
  }
}

let sendMovie = new SendMovie(token);

sendMovie.sendMovieData();
