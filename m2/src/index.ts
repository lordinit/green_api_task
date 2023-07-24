import amqp from 'amqplib';

const rabbitMQURL = 'amqp://localhost';

async function processTask(task: any) {
  // Вместо console.log() выполните фактическую обработку задания здесь
  console.log('Обрабатываемая задача', task);

  // Дополнительные операции обработки задачи

  console.log('Результат обработки:', task.data);

  // Верните результат обработки задания
  return { result: 'Задача успешно обработана' };
}

async function startM2() {
  try {
    const connection = await amqp.connect(rabbitMQURL);
    const channel = await connection.createChannel();
    const queueName = 'post_queue'; // Имя очереди, из которой будут получаться задания

    await channel.assertQueue(queueName, { durable: true });

    // Обрабатываем задания из очереди
    channel.consume(queueName, async (msg) => {
      if (msg) {
        const task = JSON.parse(msg.content.toString());

        // Обработка задания
        const result = await processTask(task);

        // Отправляем результат обработки в другую очередь
        const resultQueueName = 'exit_queue';
        await channel.assertQueue(resultQueueName, { durable: true });
        channel.sendToQueue(resultQueueName, Buffer.from(JSON.stringify(result)), {
          persistent: true,
        });

        // Подтверждаем успешную обработку задания
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Ошибка при обработке задачи:', error);
  }
}

startM2();