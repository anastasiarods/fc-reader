import { JSDOM } from "jsdom";

export interface fcButton {
  label: string;
  action?: string;
  target?: string;
}

export function getFrameHtml(
  buttons: fcButton[],
  imageUrl: String,
  postUrl: String
) {
  let html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Farcaster</title>
      ${getFrameHtmlHead(buttons, imageUrl, postUrl)}
    </head>
  </html>`;
  return html;
}

export function getFrameHtmlHead(
  buttons: fcButton[],
  imageUrl: String,
  postUrl: String
): string {
  const tags = [
    `<meta name="og:image" content="${imageUrl}"/>`,
    `<meta name="fc:frame" content="vNext"/>`,
    `<meta name="fc:frame:image" content="${imageUrl}"/>`,
    `<meta name="fc:frame:post_url" content="${postUrl}"/>`,
    ...(buttons?.flatMap((button, index) => [
      `<meta name="fc:frame:button:${index + 1}" content="${button.label}"/>`,
      button.action
        ? `<meta name="fc:frame:button:${index + 1}:action" content="${
            button.action
          }"/>`
        : "",
      button.target
        ? `<meta name="fc:frame:button:${index + 1}:target" content="${
            button.target
          }"/>`
        : "",
    ]) ?? []),
  ];

  return tags.join("");
}

export function getMetaTags(doc: JSDOM){
  //@ts-ignore
  const ogImage = doc.window.document.querySelector('meta[property="og:image"]')?.content;
  //@ts-ignore
  const ogTitle = doc.window.document.querySelector('meta[property="og:title"]')?.content;
  //@ts-ignore
  const ogDescription = doc.window.document.querySelector('meta[property="og:description"]')?.content;
  //@ts-ignore
  const twitterImage = doc.window.document.querySelector('meta[name="twitter:image"]')?.content;

  const tags = {
    ogImage: ogImage,
    ogTitle: ogTitle,
    ogDescription: ogDescription,
    twitterImage: twitterImage,
  };

  return tags;
}

export function getContentInChunks(content: string) {
  let inputText = content;

  const re = /((?:https?|ftps?):\/\/\S+)|\.(?!\s)/g;

  inputText = inputText.replace(re, function (m, g1) {
    return g1 ? g1 : ". ";
  });

  const maxCharsPerChunk = 320;

  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });

  const sentences = Array.from(segmenter.segment(inputText), (s) => s.segment);

  const chunks = commbineSentencesIntoChunks(sentences, maxCharsPerChunk);

  return chunks;
}

export function commbineSentencesIntoChunks(
  sentences: string[],
  maxCharsPerChunk: number
) {
  const chunks: string[] = [];
  let currentChunk = "";
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length >= maxCharsPerChunk) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk = currentChunk + sentence;
    }
  }
  chunks.push(currentChunk);
  return chunks;
}

export function getArticleDescription(article: any) {
  const description = {
    title: article?.title || "",
    byline: article?.byline || "",
    excerpt: article?.excerpt || "",
    siteName: article?.siteName || "",
    publishedTime: article?.publishedTime || "",
  };

  return description;
}
