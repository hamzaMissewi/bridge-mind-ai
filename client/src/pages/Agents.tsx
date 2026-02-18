import { DashboardLayout } from "@/components/DashboardLayout";
import { useAgents, useCreateAgent } from "@/hooks/use-agents";
import { useProjects } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Bot, Plus, Circle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAgentSchema, type InsertAgent } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function Agents() {
  const { data: agents, isLoading } = useAgents();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
            <p className="text-muted-foreground mt-1">Configure and monitor your autonomous agents.</p>
          </div>
          <CreateAgentDialog />
        </div>

        <div className="bg-card/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 p-4 border-b border-white/5 text-sm font-medium text-muted-foreground">
            <div>Name</div>
            <div>Status</div>
            <div>Created</div>
            <div></div>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading agents...</div>
          ) : agents?.length === 0 ? (
            <div className="p-12 text-center">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No agents found</h3>
              <p className="text-muted-foreground mb-4">Deploy your first agent to see it here.</p>
              <CreateAgentDialog />
            </div>
          ) : (
            agents?.map((agent) => (
              <div key={agent.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{agent.description}</div>
                  </div>
                </div>
                
                <div>
                  <Badge variant="outline" className="bg-white/5 border-white/10 gap-1.5 pl-1.5">
                    <Circle className={`w-2 h-2 fill-current ${
                      agent.status === "active" ? "text-green-500" : 
                      agent.status === "draft" ? "text-yellow-500" : "text-gray-500"
                    }`} />
                    <span className="capitalize">{agent.status}</span>
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {new Date(agent.createdAt || new Date()).toLocaleDateString()}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-white/10">
                    <DropdownMenuItem>Configuration</DropdownMenuItem>
                    <DropdownMenuItem>View Logs</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete Agent</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function CreateAgentDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateAgent();
  const { data: projects } = useProjects();
  const { user } = useAuth();

  const form = useForm<InsertAgent>({
    resolver: zodResolver(insertAgentSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft",
      userId: user?.id || "",
    },
  });

  const onSubmit = (data: InsertAgent) => {
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
          Deploy Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card border-white/10">
        <DialogHeader>
          <DialogTitle>Deploy New Agent</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Customer Support Bot" {...field} className="bg-secondary/50 border-white/10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(parseInt(val))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-secondary/50 border-white/10">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-white/10">
                      {projects?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What is this agent's purpose?" 
                      {...field} 
                      className="bg-secondary/50 border-white/10 resize-none h-24" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Deploying..." : "Deploy Agent"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
