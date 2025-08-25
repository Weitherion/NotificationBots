const { Telegraf, Markup } = require('telegraf');
const nodemailer = require('nodemailer');

require('dotenv').config();

const getLogger = require('../logs/logger');
const logger = getLogger('notificatAllBot.log');

// 邮箱配置
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // vps的安全组出站规则要开放465端口
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
        this.lastMailTimestamp = 0; // 新增：记录上次发邮件时间
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
                // { command: '/help', description: 'Do you need help?' },
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
            try {
                await ctx.reply('Welcome! I can send notifications to alpha.');
            } catch (err) {
                logger.error(`ctx.reply error in /start: ${err.message}`);
            }
            logger.info(`User ${ctx.from.id} ${ctx.from.first_name} started the bot`);
        });

        // 监听用户发送的 "hi notBot" 或 "HI notBot" 消息
        this.bot.hears(['hi notBot', 'HI notBot'], async (ctx) => {
            logger.info(`Received message ctx: ${JSON.stringify(ctx.chat, null, 2)}`);
            try {
                await ctx.reply(`hi, ${ctx.from.first_name} ! How can I assist you now?`);
            } catch (err) {
                logger.error(`ctx.reply error in hears: ${err.message}`);
            }
        });

        // 内联按钮
        this.bot.command("1", async (ctx) => {
            try {
                await ctx.reply('请选择用哪种方式通知alpha：', Markup.inlineKeyboard([
                    [Markup.button.callback('给alpha发邮件', 'send_email')],
                    [Markup.button.callback('给alpha发WhatsApp', 'send_whatsapp')],
                ]).resize());
            } catch (err) {
                logger.error(`ctx.reply error in /1: ${err.message}`);
            }
        });

        // 处理内联按钮回调
        this.bot.action('send_email', async (ctx) => {
            await ctx.answerCbQuery(); // 回应回调查询，防止按钮加载动画一直转圈
            const now = Date.now();
            const interval = 3 * 60 * 1000; // 3分钟
            if (now - this.lastMailTimestamp < interval) {
                try {
                    await ctx.reply('请勿频繁发送邮件，每3分钟只能发送一次。');
                } catch (err) {
                    logger.error(`ctx.reply error after mail limit: ${err.message}`);
                }
                return;
            }
            try {
                await transporter.sendMail({
                    from: process.env.mail_account,
                    to: process.env.toMail,
                    subject: 'bot通知',
                    text: `用户 ${ctx.from.first_name} 找你，时间：${new Date().toLocaleString()}`,
                });
                this.lastMailTimestamp = now; // 发送成功后更新时间戳
                try {
                    await ctx.reply(`已成功给alpha发送邮件`);
                } catch (err) {
                    logger.error(`ctx.reply error after sendMail: ${err.message}`);
                }
                logger.info(`User ${ctx.from.id} ${ctx.from.first_name} sent to alpha successfully via inline button`);
            } catch (err) {
                try {
                    await ctx.reply(`邮件发送失败: ${err.message}`);
                } catch (e) {
                    logger.error(`ctx.reply error after mail failure: ${e.message}`);
                }
                logger.error(`User ${ctx.from.id} ${ctx.from.first_name} send mail failure via inline button: ${err}`);
            }
        });

        this.bot.action('send_whatsapp', async (ctx) => {
            await ctx.answerCbQuery();
            try {
                await ctx.reply("该功能开发中。。。");
            } catch (err) {
                logger.error(`ctx.reply error in send_whatsapp: ${err.message}`);
            }
        });
    }
    webhookCallback() {
        return this.bot.webhookCallback();
    };
}

module.exports = NotificatAllBot;