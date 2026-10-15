"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@repo/ui/form";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const messageSchema = z.object({
  content: z.string().trim().min(1),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  const onSubmit = (values: MessageFormValues) => {
    if (disabled) return;
    onSend(values.content);
    reset({ content: "" });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-t border-neutral-800 p-4"
    >
      <div className="flex gap-2">
        <input
          type="text"
          {...register("content")}
          placeholder={disabled ? "Connecting..." : "Type a message..."}
          disabled={disabled}
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
      {errors.content && (
        <FormMessage variant="error" className="mt-2">
          Message cannot be empty
        </FormMessage>
      )}
    </form>
  );
}
