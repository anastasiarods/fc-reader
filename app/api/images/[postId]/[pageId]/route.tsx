import { NextRequest, NextResponse } from "next/server";
import {
  generatePostImage,
  generateTextImage,
  getAvaliablePages,
  getPageText,
} from "./utils";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string; pageId: string } }
) {
  try {

    if (params.pageId === "test") {
      return  await generateTextImage("Article was successfully minted as an NFT!");
    } 

    const pageNumber = parseInt(params.pageId);
    const availablePages = await getAvaliablePages(params.postId);

    //check if pageId is valid
    if (!availablePages.includes(pageNumber)) {
      return new NextResponse("Invalid pageId", { status: 400 });
    }

    const text = await getPageText(params.postId, pageNumber);

    if (!text) {
      return new NextResponse("Not found", { status: 404 });
    }

    let image;
    if (pageNumber === 0) {
      image = await generatePostImage(text);
    } else {
      image = await generateTextImage(text);
    }

    return image;
  } catch (e) {
    console.error(e);
    return new Response(`Internal Server Error`, {
      status: 500,
    });
  }
}
