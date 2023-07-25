Green API Task
Для работоспособности приложения необходимо выполнить следующие шаги:

Установка зависимостей:

Установите NodeJS, скачав установщик для вашей ОС (v20.1.0) с официального сайта: https://nodejs.org/

Установите RabbitMQ, скачав установщик для вашей ОС с официального сайта: https://www.rabbitmq.com/
Клонируйте проект на свой компьютер.
git clone https://github.com/lordinit/green_api_task.git


В корневой директории проекта выполните следующие команды:
# Установка зависимостей
$ npm run preinstall 

# Запуск сервисов  
$ npm run start:both   

Для корректной работы приложения убедитесь, что у вас установлен RabbitMQ с URL по умолчанию (amqp://localhost). Если RabbitMQ установлен на другом сервере или с другим URL, выполните следующие шаги:

В директориях m1 и m2 создайте файл .env.
В файле .env каждой директории (m1 и m2) укажите переменную окружения URL_RABBITMQ с URL вашего RabbitMQ сервера.
Пример содержимого файла .env:

# Директория m1 .env
URL_RABBITMQ=amqp://localhost
PORT=4390

# Директория m2 .env
URL_RABBITMQ=amqp://localhost


# Проверка

Для проверки работоспособности отправьте POST-запрос на адрес http://localhost:4390/process с телом в следующем формате:


{
    task: string;
    data: {
      key: string;
    };
}

Запрос принимается сервисом m1, затем ставится в очередь RabbitMQ. Сервис m2 извлекает запрос из очереди, обрабатывает задачу (например, меняет значение task:alalala на task:lalala), а затем сервис m1 извлекает обработанную задачу из очереди и отправляет клиенту.

Логи работы сохраняются в папке logs:

m1.log - логи сервиса m1
m2.log - логи сервиса m2
Убедитесь, что вы выполнили все шаги правильно, и приложение будет работать корректно. В случае возникновения проблем, проверьте логи и конфигурацию RabbitMQ.
