import express from 'express';
import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const rabbitMQURL = 'amqp://localhost';
const taskQueueName = 'post_queue';
const resultQueueName = 'exit_queue';

const responseMap = new Map<string, express.Response>();

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

        const res = responseMap.get(messageId);
        if (res) {
          handleResult(res, result);
          channel.ack(msg);
          responseMap.delete(messageId);
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при настройке RabbitMQ:', (error as Error).message);
  }
}

// Инициализируем соединение с RabbitMQ
setupRabbitMQ();

app.use(express.json());

app.post('/process', async (req, res) => {
  const requestData = req.body;
  console.log('Получен HTTP POST запрос:', requestData);

  const messageId = uuidv4();
  responseMap.set(messageId, res);
  requestData.messageId = messageId;

  // Отправляем данные задания в очередь с заданиями
  sendMessageToRabbitMQ(taskQueueName, requestData);

  // Устанавливаем таймаут для ответа (можно настроить нужное значение)
  const responseTimeout = 5000; // 5 секунд
  setTimeout(() => {
    const response = responseMap.get(messageId);
    if (response) {
      // Отправляем ответ с ошибкой, если обработка еще не завершена
      const timeoutResult = { error: 'Таймаут обработки' };
      if (!response.headersSent) { // Проверяем, что заголовки еще не отправлены
        handleResult(response, timeoutResult);
      }
      responseMap.delete(messageId);
    }
  }, responseTimeout);

  // Отправляем немедленный ответ клиенту
  res.status(200).json({ message: 'Запрос получен и отправлен на обработку', messageId });
});

// Функция для обработки результата и отправки его клиенту
function handleResult(res: express.Response, result: any) {
  console.log('Получен результат от RabbitMQ:', result);
  res.status(200).json(result);
}

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

    console.log('Сообщение отправлено в RabbitMQ:', message);
  } catch (error) {
    console.error('Ошибка при отправке сообщения в RabbitMQ:',(error as Error).message);
  }
}

const port = 3000;
app.listen(port, () => {
  console.log(`Сервер работает на порту:${port}`);
});
