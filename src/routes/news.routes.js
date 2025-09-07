const router = require('express').Router();
const NewsController = require('../controllers/news.controller');
const newsController = new NewsController();

router.get('/news', newsController.getNews.bind(newsController));

module.exports = router;