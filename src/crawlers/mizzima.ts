import {
  Dataset,
  createPuppeteerRouter,
  PuppeteerCrawler,
  RequestQueue,
} from 'crawlee';
import { htmlToText } from 'crawlee';
import { doesArticleContainKeywords } from '../filter.js';

const GENESIS_URLS: string[] = [
  'https://www.mizzima.com/',
  'https://www.mizzima.com/news/domestic',
  'https://www.mizzima.com/category/regional',
  'https://www.mizzima.com/news/features',
  'https://www.mizzima.com/multimedia',
];

const requestQueue = await RequestQueue.open('mizzima');
const router = createPuppeteerRouter();

router.addHandler('ARTICLES', async ({ request, page, log, enqueueLinks }) => {
  log.info('Mizzima Article', { url: request.loadedUrl });

  const title = await page.title();
  const datePublished = htmlToText(
    await page.$eval(
      'div.news-details-info > div.news-details-date > span',
      (data) => data.innerHTML
    )
  );
  const URL = request.loadedUrl;

  if (title.startsWith('Spring Revolution Daily News')) {
    const innerHTMLArray = await page.$$eval(
      '.field-item.even > p, .field-item.even > ul > li',
      (data) => {
        return data.map((el) => el.innerHTML);
      }
    );
    innerHTMLArray.forEach(async (innerHTML) => {
      const articleBody = htmlToText(innerHTML);
      const article = { title, datePublished, URL, articleBody };
      if (doesArticleContainKeywords(article)) {
        await (await Dataset.open('mizzima-dataset')).pushData(article);
      }
    });
  } else {
    const articleBody = htmlToText(
      await page.$eval('.field-item.even', (data) => data.innerHTML)
    );
    const article = { title, datePublished, URL, articleBody };
    if (doesArticleContainKeywords(article)) {
      await (await Dataset.open('mizzima-dataset')).pushData(article);
    }
  }

  await enqueueLinks({
    globs: ['https://www.mizzima.com/article/*'],
    label: 'ARTICLES',
    strategy: 'same-domain',
    requestQueue,
  });
}); //END OF ARTICLES HANDLER

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);

  await enqueueLinks({
    globs: ['https://www.mizzima.com/article/*'],
    label: 'ARTICLES',
    strategy: 'same-domain',
    requestQueue,
  });

  await enqueueLinks({
    globs: ['https://www.mizzima.com/*'],
    label: 'Mizzima',
    strategy: 'same-domain',
    requestQueue,
  });
});

export async function buildMizzimaCrawler() {
  GENESIS_URLS.forEach((url) => {
    requestQueue.addRequest({ url });
  });

  const crawler = new PuppeteerCrawler({
    requestHandler: router,
    requestQueue,
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    minConcurrency: 20,
    maxConcurrency: 100,
    maxRequestsPerMinute: 250,
    failedRequestHandler: async ({ request }) => {
      // This function is called when the crawling of a request failed too many times
      await (
        await Dataset.open('errors')
      ).pushData({
        url: request.url,
        succeeded: false,
        errors: request.errorMessages,
      });
    },
  });
  return crawler;
}
