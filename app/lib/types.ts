import { z } from "zod";

export const schema = z.object({
  url: z.string().url(),
});

export interface PostDescription {
  title: string;
  byline: string;
  excerpt: string;
  siteName: string;
  publishedTime: string;
}

export interface MetaTags {
  ogImage: any;
  ogTitle: any;
  ogDescription: any;
  twitterImage: any;
}
