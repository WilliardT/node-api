const BaseScraper = require('../scraper/base-scraper');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


class CybersportScraper extends BaseScraper {
  constructor() {
    super();
    this.name = 'cybersport';
    this.url = 'https://www.cybersport.ru/tags/cs2';
    this.base = 'https://www.cybersport.ru';
    this.selector = '.news-item'; 
  }

  async getNews() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const articles = [];

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      console.log(`Fetching news from: ${this.url}`);

      await page.goto(this.url, { waitUntil: 'networkidle2' });
      
  
      try {
        await page.waitForSelector('article, .news-item, [class*="news"]', { timeout: 10000 });
      } catch (timeoutError) {
        console.log('Timeout waiting for news elements, proceeding anyway...');
      }

      const html = await page.content();
      const $ = cheerio.load(html);

      const newsSelectors = [
        'article.news-item',
        '.news-list article',
        '[class*="news-item"]',
        '.content-item',
        'article'
      ];

      let foundArticles = false;

      for (const selector of newsSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Using selector: ${selector}, found ${elements.length} elements`);
          
          elements.each((index, element) => {
            try {
              const $element = $(element);
              
              // Ищем заголовок по различным возможным селекторам
              const titleSelectors = ['h2', 'h3', '.title', '[class*="title"]', 'a[title]'];
              let title = '';
              let linkElement = null;
              
              for (const titleSelector of titleSelectors) {
                const titleEl = $element.find(titleSelector).first();
                if (titleEl.length > 0) {
                  title = titleEl.text().trim();
                  linkElement = titleEl.is('a') ? titleEl : titleEl.closest('a').length > 0 ? titleEl.closest('a') : $element.find('a').first();
                  break;
                }
              }
              
              // Если не нашли заголовок, ищем любую ссылку
              if (!title || !linkElement || linkElement.length === 0) {
                linkElement = $element.find('a').first();
                if (linkElement.length > 0) {
                  title = linkElement.attr('title') || linkElement.text().trim();
                }
              }
              
              const relativeUrl = linkElement && linkElement.length > 0 ? linkElement.attr('href') : null;

              if (!relativeUrl || !title || title.length < 10) {
                return; // Пропускаем если нет URL или заголовка
              }

              const url = relativeUrl.startsWith('http') ? relativeUrl : `${this.base}${relativeUrl}`;

              articles.push({
                title: title.substring(0, 200), // Ограничиваем длину заголовка
                url,
                source: this.name
              });
            
            } catch (error) {
              console.error('Error processing article:', error);
            }
          });
          
          foundArticles = true;
          break; // Если нашли статьи с этим селектором, не пробуем остальные
        }
      }

      if (!foundArticles) {
        console.log('No articles found with any selector, trying fallback approach...');
        
        // Fallback: ищем все ссылки, которые могут быть новостями
        $('a[href*="/news/"], a[href*="/article/"], a[href^="/"]').each((index, element) => {
          if (articles.length >= 20) return false; // Ограничиваем количество
          
          const $element = $(element);
          const title = $element.text().trim();
          const href = $element.attr('href');
          
          if (title && title.length > 10 && href && !href.includes('#') && !href.includes('javascript:')) {
            const url = href.startsWith('http') ? href : `${this.base}${href}`;
            articles.push({
              title: title.substring(0, 200),
              url,
              source: this.name
            });
          }
        });
      }

      console.log(`Found ${articles.length} articles from ${this.name}`);
      
      // Убираем дубликаты по URL
      const uniqueArticles = articles.filter((article, index, self) => 
        index === self.findIndex(a => a.url === article.url)
      );
      
      console.log(`After deduplication: ${uniqueArticles.length} articles from ${this.name}`);
      return uniqueArticles;
    
    } catch (error) {
      console.error(`Error in CybersportScraper: ${error.message}`);
      console.error(error.stack);
      
      return []; 
    
    } finally {
      try {
        await browser.close();
      
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
}

module.exports = CybersportScraper;