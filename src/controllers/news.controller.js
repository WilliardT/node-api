const HltvScraper = require('../services/news/hltv.service');

class NewsController {
  constructor() {
    this.scrapers = [new HltvScraper()];
  }

  async getNews(req, res) {
    try {
      const allNews = await Promise.all(
        this.scrapers.map(scraper => scraper.getNews())
      );
      
      res.json(allNews.flat());

    } catch (error) {
      console.error('Error in getNews:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = NewsController;