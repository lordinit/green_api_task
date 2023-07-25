import app, { port } from './app';
import { setupRabbitMQ } from './services/rabbitMQService';
import logger from './utils/logger';

setupRabbitMQ().catch((error) => {
  logger.error('Ошибка при инициализации RabbitMQ:', (error as Error).message);
});

app.listen(port, () => {
  logger.info(`Сервис M1 запущен на порту :${port}`);
});