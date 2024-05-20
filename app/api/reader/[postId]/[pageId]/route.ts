import { NextRequest, NextResponse } from "next/server";
import { getAvaliablePages, getPostUrl } from "@/app/reader";
import { BASE_URL, readButtons, startButtons } from "@/app/constants";
import { getFrameHtml } from "@/app/utils";
import { claimNFT } from "@/app/lib/thirdweb";

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
    const ogUrl = await getPostUrl(params.postId);

    if (!ogUrl) {
      console.error("Post not found");
      return new Response("Post not found", {
        status: 400,
      });
    }

    //mint button
    if (buttonIndex === 1 && pageIndex === 0) {
      const fid = resJson.untrustedData.fid;

      const options = {
        method: "GET",
        headers: { accept: "application/json", api_key: "NEYNAR_FROG_FM" },
      };
      const address = await fetch(
        "https://api.neynar.com/v2/farcaster/user/bulk?fids=" + fid,
        options
      );

      const data = await address.json();

      const userAddress = data.users[0].verified_addresses.eth_addresses[0];

      const imageUrl = `https://fc-reader.vercel.app/api/images/${params.postId}/0.png`;

      const img = `${BASE_URL}/api/images/${params.postId}/test`;
      const postUrl = `${BASE_URL}/api/reader/${params.postId}/${0}`;
      const b = ogUrl
        ? startButtons.map((e) =>
            e.label === "Read Online" ? { ...e, target: ogUrl as string } : e
          )
        : [];
      const metadata = getFrameHtml(b, img, postUrl);
      claimNFT(userAddress, ogUrl as string, imageUrl);
      return new NextResponse(metadata, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    if (buttonIndex === 2) {
      return new Response("Redirecting", {
        status: 302,
        headers: {
          Location: ogUrl as string,
        },
      });
    }

    const pages = await getAvaliablePages(params.postId);
    const nextIndex = getNextIndex(pageIndex, pages, buttonIndex);
    const imageUrl = `${BASE_URL}/api/images/${params.postId}/${nextIndex}`;
    const hasNext = pages.length > nextIndex + 1;

    const postUrl = `${BASE_URL}/api/reader/${params.postId}/${nextIndex}`;

    let buttons = readButtons.map((e) =>
      e.label === "Read Online" ? { ...e, target: ogUrl as string } : e
    );

    //hide the next button if there is no next page
    if (!hasNext) buttons = buttons.slice(0, 2);

    //show the startting frame buttons
    if (pageIndex === 1 && buttonIndex === 1) {
      buttons = ogUrl
        ? startButtons.map((e) =>
            e.label === "Read Online" ? { ...e, target: ogUrl as string } : e
          )
        : [];
    }

    const metadata = getFrameHtml(buttons, imageUrl, postUrl);

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
