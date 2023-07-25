import amqp from 'amqplib';
import winston from 'winston';

const rabbitMQURL = 'amqp://localhost';

interface TaskRequest {
  task: string;
  data: {
    key: string;
  
  };
  messageId?:string
}

function reverseString(input: string): string {
  return input.split('').reverse().join('');
}

const logger = winston.createLogger({
  level: 'info', // Уровень логирования (можно изменить по необходимости)
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '../logs/m2.log' }), // Логи будут записываться в файл m2.log
  ],
});

async function processTask(task: TaskRequest) {
  logger.info('Обрабатываемая задача', task);

  // Дополнительные операции обработки задачи
  task.task = reverseString(task.task)
  

  //TODO тут уже можно прописывать логигку и обработку данных

  logger.info('Результат обработки:', task.task);

  // Верните результат обработки задания
  return  task ;
}

async function startM2() {
  try {
    logger.info('Сервис M2 запущен');

    const connection = await amqp.connect(rabbitMQURL);
    const channel = await connection.createChannel();
    const queueName = 'Принимаемая_здч'; // Имя очереди, из которой будут получаться задания

    await channel.assertQueue(queueName, { durable: true });

    // Обрабатываем задания из очереди
    channel.consume(queueName, async (msg) => {
      if (msg) {
        logger.info('Получено задание из очереди:', msg.content.toString());

        const task = JSON.parse(msg.content.toString());

        // Обработка задания
        const result = await processTask(task);

        // Отправляем результат обработки в другую очередь
        const resultQueueName = 'Обработаная_здч';
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