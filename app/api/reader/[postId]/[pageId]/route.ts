import { NextRequest, NextResponse } from "next/server";
import { getAvaliablePages, getPostUrl } from "@/app/reader";
import { BASE_URL, readButtons, startButtons } from "@/app/constants";
import { generateFrameMetadata } from "@/app/utils";

export const dynamic = "force-dynamic";

function getNextIndex(pageIndex: number, pages: number[], buttonIndex: number) {
  //the most first page case
  if (pageIndex === 0 && pages.length > 1) {
    return 1;
  }
  
  //the last page case
  if (pageIndex > 0 && pageIndex + 1 === pages.length) {
    return pageIndex - 1;
  }

  //left button clicked
  if (pageIndex > 0 && pageIndex + 1 !== pages.length && buttonIndex === 1) {
    return pageIndex - 1;
  }

  return pageIndex + 1;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string; pageId: number } }
) {
  try {
    const resJson = await request.json();
    const pageIndex = Number(params.pageId);
    const buttonIndex = resJson.untrustedData.buttonIndex;
    const originalUrl = await getPostUrl(params.postId);

    if (!originalUrl) {
      console.error("Post not found");
      return new Response("Post not found", {
        status: 400,
      });
    }

    if (buttonIndex === 1 && pageIndex === 0) {
      return new Response("Redirecting", {
        status: 302,
        headers: {
          Location: BASE_URL,
        },
      });
    }

    if (buttonIndex === 2) {
      return new Response("Redirecting", {
        status: 302,
        headers: {
          Location: originalUrl as string,
        },
      });
    }

    const pages = await getAvaliablePages(params.postId);
    const nextIndex = getNextIndex(pageIndex, pages, buttonIndex);
    const imageUrl = `${BASE_URL}/api/images/${params.postId}/${nextIndex}`;
    const hasNext = pages.length > nextIndex + 1;

    const postUrl = `${BASE_URL}/api/reader/${params.postId}/${nextIndex}`;

    let buttons = readButtons;

    //hide the next button if there is no next page
    if (!hasNext) buttons = buttons.slice(0, 2);

    //show the startting frame buttons
    if (pageIndex === 1 && buttonIndex === 1) {
      buttons = startButtons;
    }

    const metadata = generateFrameMetadata(buttons, imageUrl, postUrl);

    return new NextResponse(metadata, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(`Internal Server Error`, {
      status: 500,
    });
  }
}
