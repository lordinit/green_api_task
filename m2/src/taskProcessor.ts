import { RabbitMQService } from './rabbitMQService';
import logger from './utils/logger';

interface TaskRequest {
  task: string;
  data: {
    key: string;
  };
  messageId?: string;
}

export class M2Service {
  private rabbitMQService: RabbitMQService;

  constructor() {
    this.rabbitMQService = new RabbitMQService();
  }

  async processTask(task: TaskRequest) {
    logger.info('Обрабатываемая задача', task);

    // Дополнительные операции обработки задачи
    task.task = reverseString(task.task);

    // TODO: тут уже можно прописывать логигку и обработку данных

    logger.info('Результат обработки:', task);

    // Верните результат обработки задания
    return task;
  }

  async start() {
    await this.rabbitMQService.start(this.processTask);
  }
}

function reverseString(input: string): string {
  return input.split('').reverse().join('');
}