// For more information, see https://crawlee.dev/
import {
  buildMizzimaCrawler,
  //   buildTripwireScraper,
  //   buildNstCrawler,
  //   buildBangkokPostCrawler,
  //   buildPnaCrawler,
} from './crawlers/mizzima.js';
import { Actor } from 'apify';

async function main() {
  const mzCrawler = await buildMizzimaCrawler();
  //   const tripwire = await buildTripwireScraper({ browserCtx });
  //   const nstCrawler = await buildNstCrawler({ browserCtx });
  //   const pnaCrawler = await buildPnaCrawler({ browserCtx });
  //   const bkpCrawler = await buildBangkokPostCrawler({ browserCtx });

  await Promise.all([
    mzCrawler.run(),
    // tripwire.run(),
    // nstCrawler.run(),
    // pnaCrawler.run(),
    // bkpCrawler.run(),
  ]);

  console.info('Finished running');
}

await Actor.main(async () => main());
