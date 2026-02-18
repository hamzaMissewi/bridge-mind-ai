import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { useAgents } from "@/hooks/use-agents";
import { 
  Plus, 
  ArrowUpRight, 
  Clock, 
  Zap, 
  Code,
  Box
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: agents, isLoading: loadingAgents } = useAgents();

  const stats = [
    { title: "Active Projects", value: projects?.length || 0, icon: Box, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Deployed Agents", value: agents?.length || 0, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { title: "Total Skills", value: "24", icon: Code, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your agents today.</p>
          </div>
          <Button className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-white/5 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingProjects ? (
              // Loading Skeletons
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-secondary/50 animate-pulse" />
              ))
            ) : projects?.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-card/30 rounded-2xl border border-white/5 border-dashed">
                <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Create your first project to get started.</p>
                <Button variant="outline">Create Project</Button>
              </div>
            ) : (
              projects?.slice(0, 3).map((project) => (
                <Card key={project.id} className="group border-white/5 bg-card/50 hover:bg-card hover:border-primary/20 transition-all cursor-pointer overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-primary" />
                  </div>
                  <CardHeader>
                    <CardTitle className="truncate pr-8">{project.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                      {project.description || "No description provided."}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-xs text-muted-foreground gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Updated 2h ago</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
