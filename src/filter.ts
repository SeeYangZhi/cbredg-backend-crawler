import { KEYWORDS } from './keywords.js';
import { Article } from './types.js';

export function doesArticleContainKeywords(article: Article): boolean {
  const { articleBody } = article;
  let matchedTokens = articleBody
    .replaceAll(/\n/g, ' ')
    .split(' ')
    .filter((token: string) => {
      const word = token.trim();
      return KEYWORDS.includes(word.toLowerCase());
    });
  if (matchedTokens.length > 0) {
    return true;
  }
  return false;
}
