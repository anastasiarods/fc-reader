"use server";

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { v4 as uuidv4 } from "uuid";
import { kv } from "@vercel/kv";
import { z } from "zod";
import isUrl from "is-url";
import { BASE_URL } from "../constants";
import {
  getArticleDescription,
  getContentInChunks,
  getMetaTags,
} from "../utils";

const schema = z.object({
  url: z.string().url(),
});

export async function getArticle(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch the page");
  }

  const html = await response.text();
  const doc = new JSDOM(html, { url });
  const tags = getMetaTags(doc);

  const reader = new Readability(doc.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error("Failed to parse the page");
  }

  return {
    content: article,
    tags: tags,
  };
}

export async function createPost(prevState: any, formData: FormData) {
  try {
    if (!formData) {
      return {
        error: "URL is required",
      };
    }

    const validatedFields = schema.safeParse({
      url: formData.get("url"),
    });

    // Return early if the form data is invalid
    if (!validatedFields.success) {
      return {
        error: "Invalid URL",
      };
    }

    const { url } = validatedFields.data;

    if (!isUrl(url)) {
      return {
        error: "Invalid URL",
      };
    }

    const uuid = uuidv4();
    const { content, tags } = await getArticle(url);

    const chunks = getContentInChunks(content?.textContent || "");
    const description = getArticleDescription(content);

    await kv.set(`post_urls_${uuid}`, url);
    await kv.hset(`post_pages_${uuid}`, {
      0: JSON.stringify({ ...description, ...tags }),
    });

    //store chunks in KV
    for (let i = 0; i < chunks.length; i++) {
      await kv.hset(`post_pages_${uuid}`, { [i + 1]: chunks[i] });
    }

    return {
      result: `${BASE_URL}/reader/${uuid}`,
    };
  } catch (error) {
    console.error(error);
    return {
      error: "An error occurred",
    };
  }
}
