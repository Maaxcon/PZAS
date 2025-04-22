const express = require('express');
const app = express();
const path = require('path');

// Статика
app.use(express.static(path.join(__dirname, 'public')));

// Віддати HTML файл
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(3000, () => {
  console.log('Сайт запущено на http://localhost:3000');
});
