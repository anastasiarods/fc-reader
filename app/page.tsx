"use client";

import { useState } from "react";
import { createPost } from "./lib/reader";
import { useFormState, useFormStatus } from "react-dom";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const initialState = {
  error: "",
  result: undefined,
};

const LinkButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  return (
    <button
      className="flex justify-between items-center px-4 bg-white p-4 rounded-md shadow-sm border-lg outline-none focus-none text-left"
      onClick={onCopy}
    >
      <p className="text-blue-500 text-sm w-9/12">{text}</p>

      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-500"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-500"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      )}
    </button>
  );
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="text-white bg-gray-900 hover:bg-gray-800 font-medium rounded-full text-sm px-5 py-2.5 me-2 focus:outline-none ring-0"
      aria-disabled={pending}
    >
      {pending ? "Loading..." : "Submit"}
    </button>
  );
}

export default function Home() {
  const [state, formAction] = useFormState(createPost, initialState);

  return (
    <main className="flex min-h-screen flex-col items-center px-24 pt-24">
      <div className="space-y-3 w-2/3 max-w-2xl flex-1 flex flex-col gap-8 items-center">
        <h1 className="text-3xl font-bold">
          Share readable link at Farcaster as a frame
        </h1>
        <form
          action={formAction}
          className="bg-white items-center justify-between w-full flex rounded-full shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden"
        >
          <input
            type="text"
            id="default-input"
            placeholder="https://example.com"
            name="url"
            className="bg-transparent border text-gray-900 text-sm border-none outline-none block w-full p-4 "
          />
          <SubmitButton />
        </form>

        <div className="px-4">
          {state.error && (
            <div className="text-red-500 px-4">
              {
                "Oops! This link can't be parsed. Please consider trying a link from a different source."
              }
            </div>
          )}

          {state.result && <LinkButton text={state.result} />}
        </div>
      </div>
      <div className="container flex justify-center py-4 flex-row items-center space-y-0 md:h-16 gap-8">
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
  );
}
