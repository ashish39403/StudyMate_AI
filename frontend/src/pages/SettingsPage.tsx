import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { extractApiError, profileApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const profileSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
});

const extendedSchema = z.object({
  college: z.string().optional(),
  course: z.string().optional(),
  semester: z
    .union([
      z.string().length(0),
      z.coerce.number().int().min(1).max(8),
    ])
    .optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;
type ExtendedValues = z.infer<typeof extendedSchema>;

export function SettingsPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    },
  });

  const extendedQuery = useQuery({
    queryKey: ["profile", "extended"],
    queryFn: profileApi.getExtended,
  });

  const extendedForm = useForm<ExtendedValues>({
    resolver: zodResolver(extendedSchema),
    defaultValues: { college: "", course: "", semester: "" as never },
  });

  useEffect(() => {
    if (extendedQuery.data) {
      extendedForm.reset({
        college: extendedQuery.data.college || "",
        course: extendedQuery.data.course || "",
        semester: extendedQuery.data.semester
          ? (String(extendedQuery.data.semester) as never)
          : ("" as never),
      });
    }
  }, [extendedQuery.data, extendedForm]);

  const updateProfile = useMutation({
    mutationFn: (v: ProfileValues) => profileApi.update(v),
    onSuccess: (u) => {
      setUser(u);
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(extractApiError(e, "Update failed")),
  });

  const updateExtended = useMutation({
    mutationFn: (v: ExtendedValues) =>
      profileApi.updateExtended({
        college: v.college || undefined,
        course: v.course || undefined,
        semester: v.semester ? Number(v.semester) : undefined,
      }),
    onSuccess: () => {
      toast.success("Academic info updated");
      qc.invalidateQueries({ queryKey: ["profile", "extended"] });
    },
    onError: (e) => toast.error(extractApiError(e, "Update failed")),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, subscription, and account.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-5">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">
                Personal info
              </h2>
              <form
                onSubmit={profileForm.handleSubmit((v) =>
                  updateProfile.mutate(v),
                )}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>First name</Label>
                    <Input {...profileForm.register("first_name")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last name</Label>
                    <Input {...profileForm.register("last_name")} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Username</Label>
                    <Input value={user?.username || ""} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">
                Academic info
              </h2>
              <form
                onSubmit={extendedForm.handleSubmit((v) =>
                  updateExtended.mutate(v),
                )}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label>College</Label>
                  <Input
                    placeholder="e.g. IIT Delhi"
                    {...extendedForm.register("college")}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Course</Label>
                    <Input
                      placeholder="e.g. Computer Science"
                      {...extendedForm.register("course")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Semester</Label>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      placeholder="1-8"
                      {...extendedForm.register("semester")}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={updateExtended.isPending}>
                    {updateExtended.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-lg font-semibold">
                      Free plan
                    </h2>
                    <Badge variant="secondary">Current</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to Pro for unlimited everything.
                  </p>
                </div>
                <Button>
                  <Sparkles className="h-4 w-4" /> Upgrade — ₹299/mo
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                <UsageBar label="AI questions" used={32} total={50} />
                <UsageBar label="Syllabi uploaded" used={1} total={1} />
                <UsageBar label="Flashcard decks" used={2} total={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-red-500/30 bg-red-500/[0.03]">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-300 mt-0.5" />
                <div className="flex-1">
                  <h2 className="font-display text-lg font-semibold text-red-200">
                    Delete account
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    Permanently delete your account, syllabi, and all generated
                    content. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you absolutely sure? This will sign you out.",
                      )
                    ) {
                      toast.info("Account deletion requested");
                      logout();
                    }
                  }}
                >
                  Delete my account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsageBar({
  label,
  used,
  total,
}: {
  label: string;
  used: number;
  total: number;
}) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {used} / {total}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
