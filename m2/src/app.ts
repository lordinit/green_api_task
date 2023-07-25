import { M2Service } from './taskProcessor';
import logger from './utils/logger';

async function runM2Service() {
  try {
    logger.info('Сервис M2 запущен');
    const m2Service = new M2Service();
    await m2Service.start();
  } catch (error) {
    logger.error('Ошибка при запуске сервиса M2:', (error as Error).message);
  }
}

runM2Service();