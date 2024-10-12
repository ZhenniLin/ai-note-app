/* eslint-disable @typescript-eslint/no-unused-vars */
import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import { ChatCompletionMessage } from "openai/resources/index.mjs";
import { openai as OpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    // 从请求中提取 JSON 数据 - 获取消息
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    // 限制传递给 OpenAI 模型的消息数量，这里只取最近的 6 条消息进行处理 - 处理并截取最新的聊天消息
    const messagesTruncated = messages.slice(-6);

    // 生成嵌入向量
    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n"),
    );

    const { userId } = auth();

    // 使用向量查询查询用户的笔记
    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 4,
      filter: { userId },
    });

    // 查询笔记的具体内容
    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    console.log("Relevant notes found: ", relevantNotes);

    // 生成系统消息 - 返回给OpenAI模型的系统提示
    const systemMessage: ChatCompletionMessage = {
      role: "assistant",
      content:
        "You are an intelligent note-taking app. You answer the user's qustion based on their existing notes." +
        "The relevant notes for this query are:\n" +
        relevantNotes
          .map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
          .join("\n\n"),
      refusal: "Sorry",
    };

    // 调用OpenAI生成回答
    const systemMessageContent = systemMessage.content ?? "";

    const result = await streamText({
      model: OpenAI("gpt-3.5-turbo"), //
      system: systemMessageContent, // 将系统消息作为提示
      prompt: messagesTruncated.map((message) => message.content).join("\n"), // 用户的输入作为提示
    });

    // 将生成的回答流式返回
    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
