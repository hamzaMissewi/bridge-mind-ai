import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { User, Mail, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
        </div>

        {/* Profile Section */}
        <Card className="bg-card/50 border-white/5">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information and avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-2 border-primary/20">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {user?.firstName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Avatar</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input defaultValue={user?.firstName || ""} className="pl-10 bg-secondary/50 border-white/10" readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input defaultValue={user?.lastName || ""} className="pl-10 bg-secondary/50 border-white/10" readOnly />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input defaultValue={user?.email || ""} className="pl-10 bg-secondary/50 border-white/10" readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section (Placeholder) */}
        <Card className="bg-card/50 border-white/5">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your security preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Two-Factor Auth</h4>
                  <p className="text-sm text-muted-foreground">Not enabled</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
