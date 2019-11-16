require("dotenv").config();

const Telegraf = require("telegraf");
const TelegrafInlineMenu = require("telegraf-inline-menu");
const { getAirtmRates } = require("./scrapping");
const bot = new Telegraf(process.env.BOT_TOKEN);

const menu = new TelegrafInlineMenu(
    ctx => `Hola ${ctx.from.first_name}! Elige una opción:`
);
menu.setCommand("rates");
menu.setCommand("start");

menu.simpleButton("AirTM", "a", {
    doFunc: async ctx => {
        const data = await getAirtmRates();
        return ctx.replyWithHTML(`
            <b>AirTM</b>
            General: Bs. ${data.general}
            Compra: Bs. ${data.buy}
            Venta: Bs. ${data.sell}
        `);
    }
});

menu.simpleButton("DolarToday", "b", {
    doFunc: async ctx => ctx.reply("https://dolartoday.com/")
});

bot.catch((err, ctx) => {
    console.log(`Ooops, ecountered an error for ${ctx.updateType}`, err);
    ctx.reply(`Disculpa ${ctx.from.first_name}, he tenido un error 🙁`);
});
// bot.start(ctx => ctx.reply("Welcome!"));
// bot.help(ctx => ctx.reply("Send me a sticker"));
// bot.on("sticker", ctx => ctx.reply("👍"));
bot.hears(/^hi$/i, ctx => ctx.reply(`Hi ${ctx.from.first_name}!`));
bot.hears(/^hola$/i, ctx => ctx.reply(`Hola ${ctx.from.first_name}!`));
bot.hears(/^hello$/i, ctx => ctx.reply(`Hello ${ctx.from.first_name}!`));
bot.hears(/^hallo$/i, ctx => ctx.reply(`Hallo ${ctx.from.first_name}!`));

// bot.command("oldschool", ctx => ctx.reply("Hello"));
// bot.command("modern", ({ reply }) => reply("Yo"));
// bot.command("hipster", Telegraf.reply("λ"));
bot.use(menu.init());
bot.launch();

console.log(`Running... ${new Date()}`);
