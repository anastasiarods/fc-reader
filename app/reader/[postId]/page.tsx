import { getFrameMetadata } from "frog/next";
import type { Metadata, ResolvingMetadata } from "next";
import { BASE_URL } from "../../constants";
import { getPostUrl } from "@/app/lib/db";
import Script from "next/script";

type Props = {
  params: { postId: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.postId;
  const frameMetadata = await getFrameMetadata(`${BASE_URL}/api/reader/${id}`);
  return {
    other: frameMetadata,
  };
}

export default async function Page({ params }: Props) {
  const { postId } = params;
  const ogUrl = await getPostUrl(postId);
  return (
    <>
      {/* <Script
        id="my-script"
        strategy="beforeInteractive"
      >{`typeof window !== "undefined" && window.location.replace("${ogUrl}")`}</Script> */}

      <main className="flex min-h-screen flex-col items-center px-24 pt-24">
        <h1>Paste this link in https://warpcast.com/</h1>
      </main>
    </>
  );
}
