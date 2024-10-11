import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
  throw Error("PINECONE_API_KEY is not set");
}

const pinecone = new Pinecone({
  apiKey,
  // controllerHostUrl:
  //   "https://nextjs-ai-note-app-pj169n8.svc.aped-4627-b74a.pinecone.io",
});

export const notesIndex = pinecone.index("nextjs-ai-note-app");
