/** @jsxImportSource frog/jsx */

import { ASPECT_RATIO, BASE_URL, IMG_HEIGHT, IMG_WIDTH } from "@/app/constants";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { getAvaliablePages, getPageText, getPostUrl } from "@/app/lib/db";
import { Box, vars, Text } from "@/app/lib/ui";
import { newPost } from "@/app/lib/reader";
import { schema } from "@/app/lib/types";
import { Heading, VStack } from "@/app/lib/ui";
import { TextInput } from "frog";
import isUrl from "is-url";

const shareLink = `https://warpcast.com/~/compose?embeds[]=${BASE_URL}/reader/`;

const app = new Frog({
  basePath: "/api/reader",
  ui: { vars },
});

app.frame("/create", async (c) => {
  const { inputText } = c;
  let error = null;
  let uuid = null;

  if (inputText) {
    const validatedFields = schema.safeParse({
      url: inputText,
    });

    if (!validatedFields.success || !isUrl(inputText)) {
      error = "Invalid URL";
    } else {
      const { url } = validatedFields.data;
      uuid = await newPost(url);
      error = uuid ? null : "Invalid URL";
    }
  }

  //If new link was created, return success message frame
  if (uuid) {
    return c.res({
      image: (
        <Box
          grow
          alignVertical="center"
          backgroundColor="background200"
          padding="32"
        >
          <VStack gap="4">
            <Heading>New FCReader Frame ✅</Heading>
            <Text color="text100" size="20">
              New frame was successfully created! You can share it using the
              share button
            </Text>
          </VStack>
        </Box>
      ),
      intents: [
        <Button.Link href={shareLink + uuid}>Share</Button.Link>,
        <Button.Reset>Reset</Button.Reset>,
      ],
    });
  }

  return c.res({
    image: (
      <Box
        grow
        alignVertical="center"
        backgroundColor="background200"
        padding="32"
      >
        <VStack gap="4">
          <Heading>
            {error ? "New FCReader Frame ❌" : "New FCReader Frame 📖"}
          </Heading>
          <Text color="text100" size="20">
            {error
              ? `Could't create a new frame. ${error || ""}`
              : "Paste a URL in the input field to create a new frame"}
          </Text>
        </VStack>
      </Box>
    ),
    intents: [
      <TextInput placeholder="Enter url..." />,
      <Button value="submit">Submit</Button>,
      <Button.Reset>Reset</Button.Reset>,
    ],
  });
});

app.frame("/:postId", async (c) => {
  const postId = c.req.param("postId");
  const ogUrl = (await getPostUrl(postId)) as string;

  return c.res({
    image: `${BASE_URL}/api/images/${postId}/0.png`,
    imageAspectRatio: ASPECT_RATIO,
    intents: [
      <Button value="create" action={`/create`}>
        Create your Link
      </Button>,
      <Button.Link href={ogUrl}>Read Online</Button.Link>,
      <Button action={`/${postId}/${1}`} value="read">
        Read Inline
      </Button>,
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
  const text = await getPageText(postId, pageIndex);

  return c.res({
    image: (
      <Box
        grow
        alignVertical="center"
        backgroundColor="background200"
        padding="24"
      >
        <Text color="text100" size="24" weight="300">
          {text}
        </Text>
      </Box>
    ),
    imageOptions: {
      width: IMG_WIDTH,
      height: IMG_HEIGHT,
    },
    imageAspectRatio: ASPECT_RATIO,
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
