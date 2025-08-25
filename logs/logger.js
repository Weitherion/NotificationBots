const { createLogger, format, transports } = require('winston');

function getLogger(logFileName = 'app.log') {
    return createLogger({
        // 日志级别，高到低：error, warn, info, http, verbose, debug, silly
        // 设置全局日志级别阈值，只有级别等于或高于 info 的日志才会被处理和输出（包括写入文件和控制台）。
        level: 'info',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
        ),
        transports: [
            // 打印到控制台，适合dev
            new transports.Console(),
            // 根据日志级别自动分流到不同的文件，info级别会记录 info,warn,error
            new transports.File({ filename: `logs/logfiles/${logFileName}`, level: 'info' }),
            // error级别只记录 error
            new transports.File({ filename: `logs/logfiles/${logFileName}_error`, level: 'error' })
        ],
    });
}

module.exports = getLogger;