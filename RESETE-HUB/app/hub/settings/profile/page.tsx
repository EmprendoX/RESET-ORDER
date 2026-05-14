import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import {
  updateProfileFormAction,
  uploadAvatarFormAction,
} from "@/lib/actions/profile";

export default async function ProfileSettingsPage() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = (profile?.display_name as string) ?? "";
  const avatarUrl = (profile?.avatar_url as string | null) ?? null;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-bold">Tu perfil</h1>

      <Card className="space-y-3">
        <h2 className="text-base font-semibold">Foto de perfil</h2>
        <div className="flex items-center gap-4">
          <Avatar url={avatarUrl} name={displayName} size="lg" />
          <form action={uploadAvatarFormAction} className="flex flex-col gap-2">
            <input
              type="file"
              name="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              required
              className="text-sm text-[var(--text-secondary)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--cta)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:brightness-110"
            />
            <Button type="submit" variant="secondary">
              Subir foto
            </Button>
            <p className="text-xs text-[var(--text-secondary)]">
              PNG, JPG, WebP o GIF. Máximo 2MB.
            </p>
          </form>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-base font-semibold">Datos del perfil</h2>
        <form action={updateProfileFormAction} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="displayName">Nombre visible</Label>
            <Input
              id="displayName"
              name="displayName"
              required
              minLength={2}
              defaultValue={displayName}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              maxLength={500}
              defaultValue={(profile?.bio as string) ?? ""}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="country">País</Label>
              <Input id="country" name="country" defaultValue={(profile?.country as string) ?? ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" defaultValue={(profile?.city as string) ?? ""} />
            </div>
          </div>
          <Button type="submit">Guardar cambios</Button>
        </form>
      </Card>
    </div>
  );
}
