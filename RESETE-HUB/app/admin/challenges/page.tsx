import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createChallengeFormAction } from "@/lib/actions/challenges";

export default function AdminChallengesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Retos</h1>
      <Card className="space-y-3">
        <form action={createChallengeFormAction} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="slug">Slug (solo minúsculas y guiones)</Label>
            <Input id="slug" name="slug" required pattern="[a-z0-9-]+" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="startsAt">Inicio (YYYY-MM-DD)</Label>
              <Input id="startsAt" name="startsAt" placeholder="2026-05-10" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endsAt">Fin (YYYY-MM-DD)</Label>
              <Input id="endsAt" name="endsAt" placeholder="2026-06-10" />
            </div>
          </div>
          <Button type="submit">Crear reto</Button>
        </form>
      </Card>
    </div>
  );
}
