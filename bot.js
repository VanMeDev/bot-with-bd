const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();

// Токен вашего бота
const token = '7154361662:AAGn2AysSz0m_SJJYQuA_GOsfuRRs7C-mIk';

// Создаем экземпляр бота
const bot = new TelegramBot(token, {polling: true});

// Подключение к базе данных SQLite
let db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Создаем таблицу пользователей, если она не существует
db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    first_name TEXT,
    last_name TEXT
)`);

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const userId = msg.from.id;
    const username = msg.from.username;
    const firstName = msg.from.first_name;
    const lastName = msg.from.last_name;

    db.run(`INSERT INTO users (user_id, username, first_name, last_name) VALUES (?, ?, ?, ?)`, [userId, username, firstName, lastName], function(err) {
        if (err) {
            return console.log(err.message);
        }
        console.log(`A user has been inserted with user_id ${userId}`);
    });

    bot.sendMessage(msg.chat.id, `Привет, ${firstName}! Ты был добавлен в базу данных.`);
});

// Обработка команды /users
bot.onText(/\/users/, (msg) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        let response = 'Пользователи в базе данных:\n';
        rows.forEach((row) => {
            response += `${row.first_name} ${row.last_name} (@${row.username})\n`;
        });
        bot.sendMessage(msg.chat.id, response);
    });
});
