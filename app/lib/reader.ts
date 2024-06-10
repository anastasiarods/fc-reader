"use server";

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import isUrl from "is-url";
import { BASE_URL } from "../constants";
import {
  getArticleDescription,
  getContentInChunks,
  getMetaTags,
} from "../utils";
import { schema } from "./types";
import * as db from "./db";

export async function newPost(url: string) {
  const { content, tags } = await getArticle(url);
  const chunks = getContentInChunks(content?.textContent || "");
  const description = getArticleDescription(content);
  const uuid = await db.newPost(url, description, chunks, tags);
  return uuid;
}

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

    const uuid = await newPost(url);

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
