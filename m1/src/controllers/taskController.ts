import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TaskRequest } from '../models/taskRequest';
import logger from '../utils/logger';
import { sendMessageToRabbitMQ, taskQueueName, waitForResult } from '../services/rabbitMQService';

export const resultsMap = new Map<string, any>();
export const responseMap = new Map<string, Response>();

export async function processTask(req: Request, res: Response) {
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
}
