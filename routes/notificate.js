var express = require('express');
var router = express.Router();

require('dotenv').config();

const getLogger = require('../logs/logger');
const logger = getLogger('notificate.log');

// bot
const notificatAllBot = require('../bots/notificatAllBot');
const notBot = new notificatAllBot(process.env.notificat_all_bot_token);
// 把Telegraf机器人的 webhook 处理函数挂载到Express路由上,  /notificate/notBot
router.use('/notBot', notBot.webhookCallback());


/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send("Notification Bot is running");
});

module.exports = router;
