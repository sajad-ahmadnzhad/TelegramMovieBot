import TelegramBot from "node-telegram-bot-api";
require("../config/db");
require('dotenv').config()
let { messageStartBot } = require("../messagesBot/message");
let { startBot, genreMovie } = require("../replyMarkups/markup");
let { movies } = require("../models/movieModel");
let token = process.env.BOT_TOKEN as string || "6475062422:AAHuBVOZqgUdQNj_Tu0NpHpLhXNj53Xgang";

class StartBot {
  protected bot: TelegramBot;
  constructor(protected token: string) {
    this.bot = new TelegramBot(token, { polling: true });
  }

  sendMessage(): void {
    this.bot.onText(/\/start/, (msg) => {
      let id = msg.from!.id;
      this.bot.sendMessage(id, messageStartBot(msg.from?.first_name), startBot);
    });
    this.cllbackQueryHandler();
  }

  cllbackQueryHandler() {
    this.bot.on("callback_query", (msg) => {
      let data = msg.data;
      let id = msg.from.id;
      this.bot.answerCallbackQuery(msg.id);

      let resultMarkup;
      if (typeof startBot.reply_markup == "string")
        resultMarkup = JSON.parse(startBot.reply_markup).inline_keyboard;
      else resultMarkup = startBot.reply_markup.inline_keyboard;

      resultMarkup.flat(Infinity).forEach((item: { callback_data: string }) => {
        let message = "ژانر مورد نظر را انتخاب نمایید";
        switch (data) {
          case item.callback_data:
          this.bot.editMessageText(message, {
            reply_markup: genreMovie(data).reply_markup,
            chat_id: id,
            message_id: msg.message?.message_id,
          });
            break;
        }
      });
      switch (data) {
        case "backToListIndustrys":
          this.bot.editMessageText(messageStartBot(msg.from.first_name), {
            reply_markup: startBot.reply_markup,
            chat_id: id,
            message_id: msg.message?.message_id,
          });
          break;
      }
    });
  }
}

class AdminMessage extends StartBot {
  constructor(token: string) {
    super(token);
  }
  messageAdminHandler() {
    this.sendMessage();
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

          if (!movieName || movieName.length < 2)
            return this.bot.sendMessage(id, "نام فیلم معتبر نیست");

          let regexGenre = /ژانر: (.+)/;
          let matchGenre = msg.caption!.match(regexGenre);
          let movieGenre = matchGenre![1];
          let checkNameMovie = await movies.findOne({ movieName });
          if (checkNameMovie) {
            let message = "این فیلم از قبل در دیتابیس قرار دارد";
            return this.bot.sendMessage(id, message);
          }

          await movies.create({
            movieName,
            movieGenre,
            moviePhoto: msg.photo[0].file_id,
            movieCaption: msg.caption,
            movieIndustry,
          });
          this.bot.sendMessage(
            id,
            `فیلم ${movieName} با موفقیت در دیتابیس قرار گرفت`
          );
        } else {
          this.bot.sendMessage(id, "کپشن معتبر نیست");
        }
      }
    });
  }
}

let adminMessage = new AdminMessage(token);
adminMessage.messageAdminHandler();
