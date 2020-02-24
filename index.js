require('dotenv').config();

const Telegraf = require('telegraf');
const TelegrafInlineMenu = require('telegraf-inline-menu');
const { getAirtmRates, getDolarToday, getMonitor } = require('./data');
const bot = new Telegraf(process.env.BOT_TOKEN);

const menu = new TelegrafInlineMenu(ctx => {
    console.log(
        `${new Date()} - ${ctx.from.first_name} @${
            ctx.from.username
        }, lo ha usado`
    );
    bot.telegram.sendMessage(
        process.env.CHAT_ID,
        `${ctx.from.first_name} @${ctx.from.username}, lo ha usado`
    );
    return `Hola ${ctx.from.first_name}! Elige una opción:`;
});
menu.setCommand('rates');
menu.setCommand('start');

menu.simpleButton('AirTM', 'a', {
    doFunc: async ctx => {
        const data = await getAirtmRates();
        let message = '<b>AirTM</b> \n';
        message += `General: Bs. ${data.general} \n`;
        message += `Compra: Bs. ${data.buy} \n`;
        message += `Venta: Bs. ${data.sell}`;

        return ctx.replyWithHTML(message);
    }
});

menu.simpleButton('DolarToday', 'b', {
    doFunc: async ctx => {
        const data = await getDolarToday();
        let message = '<b>Dolartoday</b> \n';
        message += '<b>USD</b> \n';

        for (let key in data.USD) {
            message += `${key}: Bs. ${data.USD[key]} \n`;
        }

        message += '<b>EUR</b> \n';

        for (let key in data.EUR) {
            message += `${key}: Bs. ${data.EUR[key]} \n`;
        }

        return ctx.replyWithHTML(message);
    }
});

menu.simpleButton('@MonitorDolarVzla', 'm', {
    doFunc: async ctx => {
        let res = await getMonitor();

        if (res.img) {
            let message = '<b>@MonitorDolarVzl</b>';
            ctx.replyWithHTML(message);
            return ctx.replyWithPhoto(res.data);
        } else {
            let message = '<b>@MonitorDolarVzl</b> \n';
            message += res.data;
            return ctx.replyWithHTML(message);
        }
    }
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

require('./server');
