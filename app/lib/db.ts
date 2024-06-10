import { kv } from "@vercel/kv";
import { MetaTags, PostDescription } from "./types";
import { v4 as uuidv4 } from "uuid";

export async function getAvaliablePages(postId: string) {
  try {
    const pages = await kv.hkeys(`post_pages_${postId}`);
    return pages as unknown as number[];
  } catch (error) {
    console.error(error);
    return [];
  }
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

export async function getPostUrl(postId: string): Promise<string | undefined> {
  try {
    const url = await kv.get(`post_urls_${postId}`);
    return url as string;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function newPost(
  url: string,
  description: PostDescription,
  chunks: string[],
  tags: MetaTags
) {
  const uuid = uuidv4();

  await kv.set(`post_urls_${uuid}`, url);
  await kv.hset(`post_pages_${uuid}`, {
    0: JSON.stringify({ ...description, ...tags }),
  });

  //store chunks in KV
  for (let i = 0; i < chunks.length; i++) {
    await kv.hset(`post_pages_${uuid}`, { [i + 1]: chunks[i] });
  }

  return uuid;
}
