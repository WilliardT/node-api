class BaseScraper {
  constructor() {
    if (this.constructor === BaseScraper) {
      throw new Error("Can't instantiate abstract class");
    }
  }

  async getNews() {
    throw new Error('Method getNews() must be implemented');
  }
}

module.exports = BaseScraper;