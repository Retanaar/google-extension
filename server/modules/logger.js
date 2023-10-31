const { createLogger, transports, format } = require('winston');

// Define a custom log format
const customFormat = format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
);

// Function to create a logger with a specific prefix
function createLoggerWitPrefix(prefix) {
    return createLogger({
        level: 'debug',
        format: format.combine(
            format.timestamp(),
            format.printf(({ timestamp, level, message }) => {
                return `[APP][${timestamp}] [${level.toUpperCase()}] [${prefix}] ${message}`;
            })
        ),
        transports: [
            new transports.Console(),
        ],
    });
}
// Example usage
module.exports = createLoggerWitPrefix;
