import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertPrompt, type Prompt } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function usePrompts() {
  return useQuery<Prompt[]>({
    queryKey: [api.prompts.list.path],
    queryFn: async () => {
      const res = await fetch(api.prompts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch prompts");
      return await res.json();
    },
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertPrompt) => {
      const res = await fetch(api.prompts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create prompt");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.prompts.list.path] });
      toast({ title: "Success", description: "Prompt saved to library" });
    },
  });
}
