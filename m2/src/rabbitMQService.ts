import amqp from 'amqplib';
import logger from './utils/logger';

const rabbitMQURL = 'amqp://localhost';

export class RabbitMQService {
  async start(processTask: (task: any) => Promise<any>) {
    try {
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
}