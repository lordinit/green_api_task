import amqp from 'amqplib';
import { resultsMap, responseMap } from '../controllers/taskController';
import logger from '../utils/logger';

import dotenv from 'dotenv'

dotenv.config()

const rabbitMQURL = process.env.URL_RABBITMQ || 'amqp://localhost';
export const taskQueueName = 'Принимаемая_здч';
export const resultQueueName = 'Обработаная_здч';

let connection: amqp.Connection;
let channel: amqp.Channel;

export async function setupRabbitMQ() {
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

export async function sendMessageToRabbitMQ(queueName: string, message: any) {
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
export async function waitForResult(messageId: string): Promise<any> {
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