import { JSDOM } from "jsdom";

export interface fcButton {
  label: string;
  action?: string;
}

export function generateFrameMetadata(
  buttons: fcButton[],
  imageUrl: String,
  postUrl: String
) {
  let metadata = `<!DOCTYPE html><html><head>
      <title>Farcaster</title>
      <meta property="og:image" content="${imageUrl}" />
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${imageUrl}" />`;
  buttons.forEach((button, index) => {
    metadata += `<meta property="fc:frame:button:${index + 1}" content="${
      button.label
    }" />`;

    if (button.action) {
      metadata += `<meta property="fc:frame:button:${
        index + 1
      }:action" content="${button.action}" />`;
    }
  });
  metadata += `<meta property="fc:frame:post_url" content="${postUrl}" />
    </head></html>`;
  return metadata;
}

export function generateFrameObjMetadata(
  buttons: fcButton[],
  image: string,
  post_url: string
) {
  const metadata: Record<string, string> = {
    "fc:frame": "vNext",
  };
  metadata["fc:frame:image"] = image;
  if (buttons) {
    buttons.forEach((button, index) => {
      metadata[`fc:frame:button:${index + 1}`] = button.label;
      if (button.action) {
        metadata[`fc:frame:button:${index + 1}:action`] = button.action;
      }
    });
  }
  if (post_url) {
    metadata["fc:frame:post_url"] = post_url;
  }
  return metadata;
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
