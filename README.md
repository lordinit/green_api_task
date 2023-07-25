Green API Task

# Установка Node.js
# Windows:
Перейдите на официальный сайт Node.js: https://nodejs.org/
Скачайте установщик для вашей архитектуры (32-битная или 64-битная) и версии Node.js.
Запустите установщик и следуйте инструкциям мастера установки.
После завершения установки, откройте командную строку (Command Prompt) или PowerShell и введите команду node -v для проверки версии Node.js. Введите также npm -v для проверки версии менеджера пакетов npm.
# macOS:
Установка с использованием Homebrew (рекомендуется):

Установите Homebrew, если у вас его еще нет: https://brew.sh/index_ru
В терминале введите команду: brew install node
Установка с использованием официального установщика:

Перейдите на официальный сайт Node.js: https://nodejs.org/
Скачайте установщик для macOS.
Запустите установщик и следуйте инструкциям мастера установки.
После завершения установки, откройте терминал и введите команду node -v для проверки версии Node.js. Введите также npm -v для проверки версии менеджера пакетов npm.

# Linux (Ubuntu/Debian):
Откройте терминал и выполните следующие команды по порядку:

curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

Проверка установленных версий
node -v
npm -v

# Установка RabbitMQ
# Windows:
Перейдите на официальный сайт RabbitMQ: https://www.rabbitmq.com/
Скачайте установщик RabbitMQ для Windows.
Запустите установщик и следуйте инструкциям мастера установки.
После установки, запустите службу RabbitMQ из меню "Пуск".
# macOS:
Установка с использованием Homebrew:

В терминале введите команду: brew install rabbitmq
Установка с использованием официального пакета:

Перейдите на официальный сайт RabbitMQ: https://www.rabbitmq.com/
Скачайте установщик RabbitMQ для macOS.
Запустите установщик и следуйте инструкциям мастера установки.
После установки, запустите службу RabbitMQ в терминале с помощью команды: rabbitmq-server

# Linux (Ubuntu/Debian):
Откройте терминал и выполните следующие команды по порядку:
Установка RabbitMQ
sudo apt-get update
sudo apt-get install -y rabbitmq-server

# Запуск службы RabbitMQ
sudo service rabbitmq-server start

# Проверка статуса службы
sudo service rabbitmq-server status
После установки, RabbitMQ будет доступен на порту 5672 по умолчанию.