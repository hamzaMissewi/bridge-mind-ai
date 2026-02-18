import { DashboardLayout } from "@/components/DashboardLayout";
import { usePrompts, useCreatePrompt } from "@/hooks/use-prompts";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Sparkles, Plus, Hash, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPromptSchema, type InsertPrompt } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

export default function Prompts() {
  const { data: prompts, isLoading } = usePrompts();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyContent = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prompt Library</h1>
            <p className="text-muted-foreground mt-1">Curated prompts for your AI workflows.</p>
          </div>
          <CreatePromptDialog />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-secondary/50 animate-pulse" />
            ))
          ) : prompts?.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-card/30 rounded-2xl border border-white/5 border-dashed">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No prompts yet</h3>
              <p className="text-muted-foreground mb-4">Save your best prompts here for reuse.</p>
              <CreatePromptDialog />
            </div>
          ) : (
            prompts?.map((prompt) => (
              <div key={prompt.id} className="group bg-card/50 border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all hover:shadow-lg flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{prompt.title}</span>
                    <Badge variant="outline" className="text-xs bg-white/5 border-white/10">{prompt.category}</Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => copyContent(prompt.content, prompt.id)}
                  >
                    {copiedId === prompt.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                </div>

                <div className="bg-black/20 rounded-lg p-3 text-sm text-muted-foreground font-mono mb-4 flex-1 whitespace-pre-wrap line-clamp-4">
                  {prompt.content}
                </div>

                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {prompt.tags.map((tag, i) => (
                      <div key={i} className="flex items-center text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                        <Hash className="w-3 h-3 mr-1 opacity-50" />
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function CreatePromptDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreatePrompt();
  const { user } = useAuth();

  const form = useForm<InsertPrompt>({
    resolver: zodResolver(insertPromptSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      tags: [],
      isPublic: false,
      userId: user?.id || "",
    },
  });

  const onSubmit = (data: InsertPrompt) => {
    const payload = { ...data, userId: user?.id || "" };
    mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-card border-white/10">
        <DialogHeader>
          <DialogTitle>Add New Prompt</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Code Reviewer" {...field} className="bg-secondary/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Coding" {...field} className="bg-secondary/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="You are an expert software engineer..." 
                      {...field} 
                      className="bg-secondary/50 border-white/10 resize-none h-40 font-mono text-sm" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 bg-secondary/20 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Prompt</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Share with the community.
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Prompt"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
