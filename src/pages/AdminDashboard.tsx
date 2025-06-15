import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  suspended: boolean;
  suspension_reason: string | null;
  suspended_at: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "moderator" | "user";
}

const ADMIN_EMAILS = [
  "youradmin@email.com", // <-- set your admin email(s) here
];

const AdminDashboard = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [suspendReasons, setSuspendReasons] = useState<Record<string, string>>({});
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [selectedRoleUserId, setSelectedRoleUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfilesAndRoles = async () => {
      setLoading(true);
      // Get session user to check admin status
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("No user session found.");
        setLoading(false);
        return;
      }
      setCurrentUserEmail(session.user.email);
      // Only allow admin user access
      if (!ADMIN_EMAILS.includes(session.user.email ?? "")) {
        toast.error("You are not authorized to access this page.");
        setLoading(false);
        return;
      }
      // Fetch all profiles
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        toast.error("Failed to fetch profiles.");
      } else {
        setProfiles(data as Profile[]);
      }
      // Fetch all user admin roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("id,user_id,role");
      if (rolesError) {
        toast.error("Failed to fetch roles.");
      } else {
        setUserRoles(rolesData as UserRole[]);
      }
      setLoading(false);
    };
    fetchProfilesAndRoles();
  }, []);

  // Helper function: does user have admin role?
  const userRoleFor = (userId: string, role: "admin" | "moderator" | "user") =>
    userRoles.find(r => r.user_id === userId && r.role === role);

  const handleSuspend = async (profile: Profile) => {
    const reason = suspendReasons[profile.id]?.trim();
    if (!reason) {
      toast.error("You must specify a suspension reason.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        suspended: true,
        suspension_reason: reason,
        suspended_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Error suspending provider.");
    } else {
      setProfiles(p =>
        p.map(pr =>
          pr.id === profile.id
            ? { ...pr, suspended: true, suspension_reason: reason, suspended_at: new Date().toISOString() }
            : pr
        )
      );
      toast.success("Provider suspended.");
    }
  };

  const handleReactivate = async (profile: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        suspended: false,
        suspension_reason: null,
        suspended_at: null,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Error reactivating provider.");
    } else {
      setProfiles(p =>
        p.map(pr =>
          pr.id === profile.id
            ? { ...pr, suspended: false, suspension_reason: null, suspended_at: null }
            : pr
        )
      );
      toast.success("Provider reactivated.");
    }
  };

  // ADMIN ROLE ASSIGNMENT HANDLERS

  const handleAssignAdmin = async (userId: string) => {
    setRoleLoading(true);
    setSelectedRoleUserId(userId);
    const { error } = await supabase.from("user_roles").insert([
      { user_id: userId, role: "admin" }
    ]);
    setRoleLoading(false);
    setSelectedRoleUserId(null);
    if (error) {
      if (error.code === "23505") {
        toast.error("User is already an admin.");
      } else {
        toast.error("Failed to assign admin role.");
      }
      return;
    }
    setUserRoles(prev => [...prev, { id: crypto.randomUUID(), user_id: userId, role: "admin" }]);
    toast.success("Admin role assigned!");
  };

  const handleRemoveAdmin = async (userId: string) => {
    setRoleLoading(true);
    setSelectedRoleUserId(userId);
    // Remove JUST the 'admin' role for this user
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");
    setRoleLoading(false);
    setSelectedRoleUserId(null);
    if (error) {
      toast.error("Failed to remove admin role.");
      return;
    }
    setUserRoles(prev => prev.filter(r => !(r.user_id === userId && r.role === "admin")));
    toast.success("Admin role removed.");
  };

  if (loading) {
    return <div className="text-center py-16">Loading...</div>;
  }
  if (!ADMIN_EMAILS.includes(currentUserEmail ?? "")) {
    return <div className="text-center py-16 text-destructive">Not authorized.</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard - Provider Suspension</h1>
      {/* Admin Role Assignment Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Admin Role Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {profiles.map(profile => (
              <div key={profile.id} className="flex flex-col border rounded px-3 py-2 bg-muted mb-2">
                <div className="font-medium">
                  {profile.full_name || "(No name)"}
                  {userRoleFor(profile.id, "admin") && (
                    <span className="text-xs ml-2 px-2 py-1 bg-green-200 text-green-900 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-1">User ID: {profile.id}</div>
                {/* Prevent removing yourself or assigning admin to self */}
                <div className="flex gap-2 mt-2">
                  {!userRoleFor(profile.id, "admin") ? (
                    <Button
                      disabled={roleLoading && selectedRoleUserId === profile.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAssignAdmin(profile.id)}
                    >
                      {roleLoading && selectedRoleUserId === profile.id ? "Assigning..." : "Assign Admin"}
                    </Button>
                  ) : (
                    <Button
                      disabled={roleLoading && selectedRoleUserId === profile.id}
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveAdmin(profile.id)}
                    >
                      {roleLoading && selectedRoleUserId === profile.id ? "Removing..." : "Remove Admin"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* End of Admin Role Assignment Section */}
      <div className="grid gap-6">
        {profiles.map(profile => (
          <Card key={profile.id} className="p-2">
            <CardHeader>
              <CardTitle>
                {profile.full_name || "(No name)"}
                {profile.suspended && (
                  <span className="text-xs ml-2 px-2 py-1 bg-red-200 text-red-800 rounded">Suspended</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                <div className="flex-1">
                  <div><span className="font-medium">ID:</span> {profile.id}</div>
                  <div><span className="font-medium">Phone:</span> {profile.phone ?? "-"}</div>
                </div>
                {profile.suspended ? (
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="font-medium">Suspended at:</span> {profile.suspended_at ? new Date(profile.suspended_at).toLocaleString() : "-"}
                    </div>
                    <div>
                      <span className="font-medium">Reason:</span> {profile.suspension_reason}
                    </div>
                  </div>
                ) : null}
                <div className="flex-1 flex flex-col md:flex-row md:gap-2">
                  {!profile.suspended ? (
                    <>
                      <Input
                        name="reason"
                        className="mb-2 md:mb-0"
                        placeholder="Suspension reason"
                        value={suspendReasons[profile.id] ?? ""}
                        onChange={e => setSuspendReasons(r => ({ ...r, [profile.id]: e.target.value }))}
                      />
                      <Button
                        variant="destructive"
                        onClick={() => handleSuspend(profile)}
                      >
                        Suspend
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => handleReactivate(profile)}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
