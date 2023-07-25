import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '../logs/m1.log' }), // Логи будут записываться в файл m1.log
  ],
});

export default logger;