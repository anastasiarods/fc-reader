import { getFrameMetadata } from "frog/next";
import type { Metadata, ResolvingMetadata } from "next";
import { BASE_URL } from "../../constants";
import { getPostUrl } from "@/app/lib/db";

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
        <div className="space-y-3 w-2/3 max-w-2xl flex-1 flex flex-col gap-8 items-center text-lg">
          Paste this link in https://warpcast.com/
        </div>

        <div className="container flex justify-center py-4 flex-row items-center space-y-0 md:h-16 gap-8">
          <a
            href="/"
            rel="noopener noreferrer"
            className="text-lg font-semibold underline"
          >
            Create a new frame
          </a>
          <a
            href="https://warpcast.com/nastya"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold underline"
          >
            Contact me on Farcaster
          </a>
          <a
            href="https://github.com/anastasiarods/fc-reader"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold underline"
          >
            GitHub
          </a>
        </div>
      </main>
    </>
  );
}
