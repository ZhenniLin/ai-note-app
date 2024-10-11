import prisma from "@/lib/db/prisma";
import { createNoteSchema } from "@/lib/validation/note";
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

    // create note
    //  Prisma是一个数据库访问层，通过它可以方便地执行CRUD操作
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId,
      },
    });
    // return response
    return Response.json({ note }, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
