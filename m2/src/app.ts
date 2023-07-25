import { M2Service } from './taskProcessor';

async function runM2Service() {
  try {
    console.log('Сервис M2 запущен');
    const m2Service = new M2Service();
    await m2Service.start();
  } catch (error) {
    console.error('Ошибка при запуске сервиса M2:', (error as Error).message);
  }
}

runM2Service();