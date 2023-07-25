import amqp from 'amqplib';
import winston from 'winston';

const rabbitMQURL = 'amqp://localhost';

const logger = winston.createLogger({
  level: 'info', // Уровень логирования (можно изменить по необходимости)
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/m2.log' }), // Логи будут записываться в файл m2.log
  ],
});

async function processTask(task: any) {
  // Вместо console.log() выполните фактическую обработку задания здесь
  logger.info('Обрабатываемая задача', task);

  // Дополнительные операции обработки задачи

  logger.info('Результат обработки:', task.data);

  // Верните результат обработки задания
  return { result: 'Задача успешно обработана' };
}

async function startM2() {
  try {
    logger.info('Сервис M2 запущен');

    const connection = await amqp.connect(rabbitMQURL);
    const channel = await connection.createChannel();
    const queueName = 'post_queue'; // Имя очереди, из которой будут получаться задания

    await channel.assertQueue(queueName, { durable: true });

    // Обрабатываем задания из очереди
    channel.consume(queueName, async (msg) => {
      if (msg) {
        logger.info('Получено задание из очереди:', msg.content.toString());

        const task = JSON.parse(msg.content.toString());

        // Обработка задания
        const result = await processTask(task);

        // Отправляем результат обработки в другую очередь
        const resultQueueName = 'exit_queue';
        await channel.assertQueue(resultQueueName, { durable: true });
        channel.sendToQueue(resultQueueName, Buffer.from(JSON.stringify(result)), {
          persistent: true,
        });

        // Подтверждаем успешную обработку задания
        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.error('Ошибка при обработке задачи:', (error as Error).message);
  }
}

startM2();