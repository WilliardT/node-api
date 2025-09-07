const express = require('express');
const newsRoutes = require('./routes/news.routes');

const app = express();

app.use('/', newsRoutes);

module.exports = app;