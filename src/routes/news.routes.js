const router = require('express').Router();
const NewsController = require('../controllers/news.controller');
const newsController = new NewsController();

// Получить новости со всех источников
router.get('/news', newsController.getNews.bind(newsController));

// Получить список доступных источников
router.get('/sources', newsController.getAvailableSources.bind(newsController));

// Получить новости по источнику
router.get('/news/:source', newsController.getNewsBySource.bind(newsController));

module.exports = router;