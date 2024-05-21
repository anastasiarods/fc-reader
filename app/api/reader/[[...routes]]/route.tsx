/** @jsxImportSource frog/jsx */

import { BASE_URL } from "@/app/constants";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { getAvaliablePages, getPostUrl } from "@/app/lib/db";

const app = new Frog({
  basePath: "/api/reader",
});

app.frame("/:postId", async (c) => {
  const postId = c.req.param("postId");
  const ogUrl = (await getPostUrl(postId)) as string;

  return c.res({
    action: `/${postId}/${1}`,
    image: `${BASE_URL}/api/images/${postId}/0.png`,
    intents: [
      <Button.Link href="https://fc-reader.vercel.app/">
        Create your Link
      </Button.Link>,
      <Button.Link href={ogUrl}>Read Online</Button.Link>,
      <Button value="read">Read Inline</Button>,
    ],
  });
});

app.frame("/:postId/:pageId", async (c) => {
  const { postId, pageId } = c.req.param();
  const pageIndex = Number(pageId);
  const buttonIndex = c.buttonIndex;

  if (!buttonIndex) {
    return c.error({
      message: "Invalid Button Index",
    });
  }

  const ogUrl = (await getPostUrl(postId)) as string;
  const pages = await getAvaliablePages(postId);
  const nextPage = pageIndex + 1;
  const prevPage = pageIndex - 1;
  const hasNext = pages.length > nextPage;

  return c.res({
    image: `${BASE_URL}/api/images/${postId}/${pageId}.png`,
    intents: [
      <Button
        value="<"
        action={prevPage > 0 ? `/${postId}/${prevPage}` : `/${postId}`}
      >
        {"<"}
      </Button>,
      <Button.Link href={ogUrl}>Read Online</Button.Link>,
      hasNext && (
        <Button value=">" action={`/${postId}/${nextPage}`}>
          {">"}
        </Button>
      ),
    ],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
