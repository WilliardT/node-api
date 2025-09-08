const HltvScraper = require('../services/news/hltv.service');
const CybersportScraper = require('../services/news/cybersport.service');

class NewsController {
  constructor() {
    this.scrapers = [new HltvScraper(), new CybersportScraper()];

    // мап для быстрого поиска по имени
    this.scraperMap = {};
    this.scrapers.forEach((scraper) => {
      this.scraperMap[scraper.name] = scraper;
    });
  }

  async getNews(req, res) {
    try {
      const allNews = await Promise.all(
        this.scrapers.map((scraper) => scraper.getNews())
      );

      res.json(allNews.flat());
    } catch (error) {
      console.error('Error in getNews:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getNewsBySource(req, res) {
    try {
      const { source } = req.params;

      const scraper = this.scraperMap[source.toLowerCase()];

      if (!scraper) {
        res.status(404).json({
          error: `Source ${source} not found`,
          availableSources: Object.keys(this.scraperMap),
        });

        return;
      }

      console.log(`Getting news from ${source}`);
      const news = await scraper.getNews();

      res.json(news);
      
    } catch (error) {
      console.error(
        `Error in getNewsBySource for ${req.params.source}:`,
        error
      );
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = NewsController;
