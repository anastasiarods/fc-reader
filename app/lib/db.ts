import { kv } from "@vercel/kv";

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

export async function getPostUrl(postId: string): Promise<string | undefined>{
  try {
    const url = await kv.get(`post_urls_${postId}`);
    return url as string;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
