import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Уровень логирования (можно изменить по необходимости)
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '../logs/m2.log' }), // Логи будут записываться в файл m2.log
  ],
});

export default logger;