# Green API Task

Для работоспособности приложение необходимо установить 
1: nodeJS - https://nodejs.org/ Скачайте установщик для вашей ОС (v20.1.0) 
2: RabbitMQ - Перейдите на официальный сайт RabbitMQ: https://www.rabbitmq.com/ Скачайте установщик RabbitMQ для вашей ОС 

Далее клонируйте проект 
в корневой директории прописываем 

$npm run preinstall - установка зависимостей 
#npm run start:both - запуск сервисов 

далее для коректной работы нужно проиписать url RabbitMQ - если он стандартный (amqp://localhost) , то можно запускать , если нет , создаем файл .env , прописываем ENV - переменну (URL_RABBITMQ)
так же в директории m1 в env файле можно прописать порт(PORT) на котором будет запускатся приложение (по умполчанию порт 4390)

далее чтобы проверить работоспособность , нужно отправить запрос 
тело запроса для примера 

{
    task: string;
    data: {
      key: string;
    };
}
запрос принимает сервис m1 , далее ставит в очередь в RabbitMQ, сервис m2 достает из очереди , обрабатывает задачу(для примера я просто в обратном направлении пишу значение task )допустим занчение task:alalala ,в ответе будет task:lalala, далее сервис m1 видит информацию в очереди обработанных задач , достает и отправляет это клиенту 

логи сохраняются в папке logs  
m1.log - сервис m1 
m2.log - сервис m2 
