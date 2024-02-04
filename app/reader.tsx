"use server";

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { v4 as uuidv4 } from "uuid";
import { kv } from "@vercel/kv";
import { z } from "zod";
import isUrl from "is-url";
import { BASE_URL } from "./constants";
import { ImageResponse } from "@vercel/og";
import {
  getArticleDescription,
  getContentInChunks,
  getMetaTags,
} from "./utils";

const schema = z.object({
  url: z.string().url(),
});

export async function getArticle(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  const doc = new JSDOM(html);
  const tags = getMetaTags(doc);

  const reader = new Readability(doc.window.document);
  const article = reader.parse();
  return {
    content: article,
    tags: tags,
  };
}

export async function generateTextImage(text: string) {
  const res = new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          fontSize: 22,
          fontWeight: 300,
        }}
      >
        <div style={{ paddingLeft: 24, paddingRight: 24 }}>{text}</div>
      </div>
    ),
    {
      width: 600,
      height: 400,
      // fonts: [],
    }
  );

  return res;
}

export async function generatePostImage(data: any) {
  const image = data?.twitterImage || data?.ogImage;
  // const image = "";
  const title = data?.ogTitle || data?.title;
  const byLine = data?.byline;

  const res = new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
          backgroundColor: "#000000",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              filter: "blur(3px)",
            }}
          >
            {image && (
              <img
                src={image}
                style={{
                  minHeight: "100%",
                  minWidth: "100%",
                  objectFit: "cover",
                  overflow: "hidden",
                }}
              />
            )}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        ></div>
        <div
          style={{
            paddingLeft: 24,
            paddingRight: 24,
            color: "#fff",
            textShadow: "#000 1px 0 4px",
            fontSize: 24,
            fontWeight: 400,
          }}
        >
          {title}
        </div>

        {byLine && (
          <div
            style={{
              paddingLeft: 24,
              paddingRight: 24,
              textShadow: "#000 1px 0 4px",
              fontSize: 16,
              fontWeight: 400,
              color: "rgba(255,255,255,1)",
            }}
          >
            {`· ${byLine}`}
          </div>
        )}
      </div>
    ),
    {
      width: 600,
      height: 400,
      // fonts: [],
    }
  );

  return res;
}

export async function getPageText(postId: string, pageId: number) {
  try {
    const text = (await kv.hget(
      `post_pages_${postId}`,
      pageId.toString()
    )) as string;

    return text;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAvaliablePages(postId: string) {
  try {
    const pages = await kv.hkeys(`post_pages_${postId}`);
    return pages as unknown as number[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPostUrl(postId: string) {
  try {
    const url = await kv.get(`post_urls_${postId}`);
    return url;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function createPost(prevState: any, formData: FormData) {
  try {
    if (!formData) {
      return {
        message: "URL is required",
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
