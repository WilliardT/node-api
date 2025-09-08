const BaseScraper = require('../scraper/base-scraper');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


class HltvScraper extends BaseScraper {
  constructor() {
    super();
    this.name = 'hltv';
    this.url = 'https://www.hltv.org/';
    this.base = 'https://www.hltv.org';
    this.selector = 'a.newsline.article';
  }

  async getNews() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const articles = [];

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      console.log(`Fetching news from: ${this.url}`);

      await page.goto(this.url, { waitUntil: 'networkidle2' });
      await page.waitForSelector(this.selector, { timeout: 15000 });

      const html = await page.content();
      const $ = cheerio.load(html);

      $(this.selector).each((index, element) => {
        try {
          const $element = $(element);
          const title = $element.find('div.newstext').text().trim();
          const relativeUrl = $element.attr('href');

          if (!relativeUrl) {
            console.warn('No URL found for article:', title);
            
            return; // Skip this article if no URL
          }

          const url = relativeUrl.startsWith('http') ? relativeUrl : `${this.base}${relativeUrl}`;

          articles.push({
            title: title || 'No title',
            url,
            source: this.name
          });
        
        } catch (error) {
          console.error('Error processing article:', error);
        }
      });

      console.log(`Found ${articles.length} articles from ${this.name}`);
      
      return articles;
    
    } catch (error) {
      console.error(`Error in HltvScraper: ${error.message}`);
      console.error(error.stack);
      
      return []; // Return empty array on error
    
    } finally {
      try {
        await browser.close();
      
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
}

module.exports = HltvScraper;