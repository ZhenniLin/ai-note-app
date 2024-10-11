/* eslint-disable @typescript-eslint/no-unused-vars */
import { createNoteSchema, CreateNoteSchema } from "@/lib/validation/note";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import LoadingButton from "./ui/loading-button";
import { useRouter } from "next/navigation";

// 组件接口
interface AddNoteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AddNoteDialog = ({ open, setOpen }: AddNoteDialogProps) => {
  // 通过 useRouter 钩子获取 router 对象，用于在笔记提交后刷新页面
  const router = useRouter();

  // 初始化表单
  // <CreateNoteSchema> 表示类型
  // (createNoteSchema) 表示验证模式
  const form = useForm<CreateNoteSchema>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // 表单提交处理函数
  // input参数 - 类型CreateNoteSchema
  async function onSubmit(input: CreateNoteSchema) {
    // alert(JSON.stringify(input));
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        // 将input对象转为JSON字符串
        body: JSON.stringify(input),
      });

      if (!response.ok) throw Error("Status code: " + response.status);

      // 重置表单
      form.reset();
      // 刷新页面
      router.refresh();

      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Add Note</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Note content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
              >
                Submit
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteDialog;
