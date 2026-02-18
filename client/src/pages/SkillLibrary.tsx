import { DashboardLayout } from "@/components/DashboardLayout";
import { useSkills, useCreateSkill } from "@/hooks/use-skills";
import { useState } from "react";
import { 
  Search, 
  Code2, 
  Plus, 
  Copy, 
  Check, 
  Terminal, 
  Globe, 
  Lock 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSkillSchema, type InsertSkill } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

export default function SkillLibrary() {
  const { data: skills, isLoading } = useSkills();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredSkills = skills?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const copyCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Skill Library</h1>
            <p className="text-muted-foreground mt-1">Manage reusable capabilities for your agents.</p>
          </div>
          <CreateSkillDialog />
        </div>

        {/* Search & Filters */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search skills..." 
            className="pl-10 bg-card/50 border-white/5 focus:border-primary/50 max-w-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-card/50 animate-pulse border border-white/5" />
            ))
          ) : filteredSkills?.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No skills found. Create one to get started.
            </div>
          ) : (
            filteredSkills?.map((skill) => (
              <div key={skill.id} className="group bg-card/50 border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <Badge variant={skill.isPublic ? "default" : "secondary"} className="bg-white/5 hover:bg-white/10">
                    {skill.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                    {skill.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{skill.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[40px]">
                  {skill.description}
                </p>

                <div className="relative bg-black/40 rounded-lg p-3 group/code">
                  <pre className="text-xs font-mono text-blue-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {skill.code}
                  </pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1 h-6 w-6 hover:bg-white/10"
                    onClick={() => copyCode(skill.code, skill.id)}
                  >
                    {copiedId === skill.id ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function CreateSkillDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateSkill();
  const { user } = useAuth();

  const form = useForm<InsertSkill>({
    resolver: zodResolver(insertSkillSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      category: "general",
      isPublic: false,
      userId: user?.id || "",
    },
  });

  const onSubmit = (data: InsertSkill) => {
    // Ensure userId is set
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
          Add Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card border-white/10">
        <DialogHeader>
          <DialogTitle>Create New Skill</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Web Scraper" {...field} className="bg-secondary/50 border-white/10" />
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
                      <Input placeholder="e.g. Utility" {...field} className="bg-secondary/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What does this skill do?" 
                      {...field} 
                      className="bg-secondary/50 border-white/10 resize-none h-20" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Implementation Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Terminal className="absolute top-3 left-3 w-4 h-4 text-muted-foreground" />
                      <Textarea 
                        placeholder="async function execute() { ... }" 
                        {...field} 
                        className="font-mono bg-black/40 border-white/10 min-h-[200px] pl-10" 
                      />
                    </div>
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
                    <FormLabel className="text-base">Public Skill</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Allow other users to discover and fork this skill.
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
                {isPending ? "Creating..." : "Create Skill"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
