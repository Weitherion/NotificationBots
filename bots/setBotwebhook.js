const { Telegraf } = require('telegraf');

require('dotenv').config();

const bot = new Telegraf(`${process.env.notificat_all_bot_token}`);

(async () => {
    try {
        const result = await bot.telegram.setWebhook(`${process.env.notificat_all_bot_webhook}`);
        console.log('setWebhook Result:', result);

        const webhookInfo = await bot.telegram.getWebhookInfo();
        console.log('Webhook Info:', webhookInfo);
    } catch (error) {
        console.error('Error:', error);
    }
})();