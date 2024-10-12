/* eslint-disable @typescript-eslint/no-unused-vars */
import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import {
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
} from "@/lib/validation/note";
import { auth } from "@clerk/nextjs/server";

// 接受一个参数req，表示传递过来的请求对象，类型是Request对象，它代表HTTP请求，包含请求体、请求头、请求方法等信息
export async function POST(req: Request) {
  try {
    // 从请求体中提取JSON数据 - 这是一个Promise，解析成功后返回请求体中的JSON数据
    const body = await req.json();
    // 请求体中的数据进行验证
    const parseResult = createNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      // 返回一个错误响应，包含状态码 400（表示客户端输入无效），并附带一条错误信息
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    // 解构赋值从 parseResult.data 中提取 title 和 content
    const { title, content } = parseResult.data;

    // authorization
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // generate embedding
    const embedding = await getEmbeddingForNote(title, content);

    const note = await prisma.$transaction(async (tx) => {
      // create note
      //  Prisma是一个数据库访问层，通过它可以方便地执行CRUD操作
      const note = await tx.note.create({
        data: {
          title,
          content,
          userId,
        },
      });

      await notesIndex.upsert([
        { id: note.id, values: embedding, metadata: { userId } },
      ]);

      return note;
    });

    // return response
    return Response.json({ note }, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const parseResult = updateNoteSchema.safeParse(body);

    // 验证1 - data是否符合格式
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id, title, content } = parseResult.data;

    // 验证2 - data是否存在
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    // 验证3 - 用户
    const { userId } = auth();
    if (!userId || userId != note.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embedding = await getEmbeddingForNote(title, content);

    const updatedNote = await prisma.$transaction(async (tx) => {
      // 将用户put过来的data传入数据库
      const updatedNote = await tx.note.update({
        where: { id },
        data: { title, content },
      });

      await notesIndex.upsert([
        {
          id,
          values: embedding,
          metadata: { userId },
        },
      ]);

      return updatedNote;
    });

    return Response.json({ updatedNote }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const parseResult = deleteNoteSchema.safeParse(body);

    // 验证1 - data是否符合格式
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id } = parseResult.data;

    // 验证2 - data是否存在
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    // 验证3 - 用户
    const { userId } = auth();
    if (!userId || userId != note.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      // 将选中的note通过id再数据库里删除
      await tx.note.delete({
        where: { id },
      });

      await notesIndex.deleteOne(id);
    });

    return Response.json({ message: "Note deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getEmbeddingForNote(title: string, content: string | undefined) {
  return getEmbedding(title + "\n\n" + content);
}
