const { Telegraf, Markup } = require('telegraf');
const nodemailer = require('nodemailer');

require('dotenv').config();

const getLogger = require('../logs/logger');
const logger = getLogger('notificatAllBot.log');

// 邮箱配置
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.mail_account,
        pass: process.env.mail_app_password,
    }
});



class NotificatAllBot {
    constructor(token) {
        this.bot = new Telegraf(token);
        this.token = token;
        this.init();            // 生成实例时立即初始化
    }
    async init() {
        await this.setupCommands();
        this.setupHandlers();
    }

    async setupCommands() {
        try {
            await this.bot.telegram.setMyCommands([
                { command: '/start', description: 'Start the bot' },
                { command: '/help', description: 'Do you need help?' },
                { command: '/1', description: 'Choose notification method' }
            ]);
            logger.info('Bot commands set successfully');
        } catch (error) {
            logger.error(`Error setting bot commands: ${error.message}`);
        }
    }

    setupHandlers() {
        // 监听 /start 命令
        this.bot.start(async (ctx) => {
            await ctx.reply('Welcome! I can send notifications to alpha.');
            logger.info(`User ${ctx.from.id} ${ctx.from.first_name} started the bot`);
        });

        // 监听用户发送的 "hi notBot" 或 "HI notBot" 消息
        // 如果要在groups中监听，需要开启 group privacy mode，否则只支持私聊
        this.bot.hears(['hi notBot', 'HI notBot'], async (ctx) => {
            logger.info(`Received message ctx: ${JSON.stringify(ctx.chat, null, 2)}`);

            await ctx.reply(`hi, ${ctx.from.first_name} ! How can I assist you now?`);
        });


        // 内联按钮
        this.bot.command("1", async (ctx) => {
            // ctx.reply('请选择：', Markup.keyboard([
            //     ['给alpha发短信', '给alpha发邮件'],
            //     ['取消']
            // ]).resize());

            ctx.reply('请选择用哪种方式通知alpha：', Markup.inlineKeyboard([
                [Markup.button.callback('给alpha发邮件', 'send_email')],
                [Markup.button.callback('给alpha发WhatsApp', 'send_whatsapp')],
            ]).resize());
        });
        // 处理内联按钮回调
        this.bot.action('send_email', async (ctx) => {
            await ctx.answerCbQuery(); // 这一步很重要，防止按钮上出现加载动画
            try {
                await transporter.sendMail({
                    from: process.env.mail_account,
                    to: process.env.toMail,
                    subject: 'bot通知',
                    text: `用户 ${ctx.from.first_name} 找你，时间：${new Date().toLocaleString()}`,
                });
                ctx.reply(`已成功给alpha发送邮件`);
                logger.info(`User ${ctx.from.id} ${ctx.from.first_name} sent to alpha successfully via inline button`);
            } catch (err) {
                ctx.reply(`邮件发送失败: ${err.message}`);
                logger.error(`User ${ctx.from.id} ${ctx.from.first_name} send mail failure via inline button: ${err}`);
            }
        });


        this.bot.action('send_whatsapp', async (ctx) => {
            await ctx.answerCbQuery(); // 这一步很重要，防止按钮上出现加载动画
            ctx.reply("该功能开发中。。。");

        });
    }
    webhookCallback(path) {
        return this.bot.webhookCallback(path);
    };
}

module.exports = NotificatAllBot;