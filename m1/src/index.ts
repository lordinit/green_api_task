import express, { Request, Response } from 'express';
import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

interface TaskRequest {
  task: string;
  data: {
    key: string;
  };
  messageId?: string;
}

const app = express();
const rabbitMQURL = 'amqp://localhost';
const taskQueueName = 'Принимаемая_здч';
const resultQueueName = 'Обработаная_здч';

const responseMap = new Map<string, Response>();
const resultsMap = new Map<string, any>();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '../logs/m1.log' }), // Логи будут записываться в файл m1.log
  ],
});

// Создаем одно соединение и канал для RabbitMQ
let connection: amqp.Connection;
let channel: amqp.Channel;

async function setupRabbitMQ() {
  try {
    connection = await amqp.connect(rabbitMQURL);
    channel = await connection.createChannel();
    await channel.assertQueue(resultQueueName, { durable: true });

    // Настраиваем потребителя для очереди с результатами
    channel.consume(resultQueueName, (msg) => {
      if (msg) {
        const result = JSON.parse(msg.content.toString());
        const messageId = result.messageId;
        resultsMap.set(messageId, result);

        const res = responseMap.get(messageId);
        if (res) {
          channel.ack(msg);
          responseMap.delete(messageId);
        }
      }
    });
  } catch (error) {
    logger.error('Ошибка при настройке RabbitMQ:', (error as Error).message);
  }
}

// Инициализируем соединение с RabbitMQ
setupRabbitMQ().catch((error) => {
  logger.error('Ошибка при инициализации RabbitMQ:', (error as Error).message);
});

app.use(express.json());

app.post('/process', async (req: Request, res: Response) => {
  const requestData: TaskRequest = req.body;
  logger.info('Получен HTTP POST запрос:', requestData);

  const messageId = uuidv4();
  requestData.messageId = messageId;

  try {
    // Отправляем данные задания в очередь с заданиями
    await sendMessageToRabbitMQ(taskQueueName, requestData);

    // Ожидаем завершения обработки задачи
    const result = await waitForResult(messageId);

    // Отправляем немедленный ответ клиенту
    res.status(200).json({ message: 'Запрос получен и обработан', result });
  } catch (error) {
    logger.error('Ошибка при обработке запроса:', (error as Error).message);
    res.status(500).json({ message: 'Произошла ошибка при обработке запроса' });
  }
});

// Функция для отправки сообщения в RabbitMQ
async function sendMessageToRabbitMQ(queueName: string, message: any) {
  try {
    if (!channel) {
      throw new Error('Канал RabbitMQ не настроен.');
    }

    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    logger.info('Сообщение отправлено в RabbitMQ:', message);
  } catch (error) {
    logger.error('Ошибка при отправке сообщения в RabbitMQ:', (error as Error).message);
    throw error;
  }
}

// Функция для ожидания результата обработки задачи
function waitForResult(messageId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Ожидаем максимум 10 секунд, чтобы не заблокировать запрос навсегда в случае проблем с обработкой
    const maxWaitTime = 10000; // 10 секунд
    const pollInterval = 200; // Проверяем каждые 200 мс

    const startTime = Date.now();

    // Проверяем наличие результата каждые pollInterval мс
    const intervalId = setInterval(() => {
      const result = resultsMap.get(messageId);
      if (result) {
        clearInterval(intervalId);
        resolve(result);
      } else if (Date.now() - startTime > maxWaitTime) {
        // Время ожидания истекло, возвращаем пустой результат
        clearInterval(intervalId);
        reject(new Error('Время ожидания истекло'));
      }
    }, pollInterval);
  });
}


const port = 3000;
app.listen(port, () => {
  logger.info(`Сервис M1 запущен на порту :${port}`);
});