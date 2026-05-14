import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEventFormAction } from "@/lib/actions/challenges";

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Eventos</h1>
      <Card className="space-y-3">
        <form action={createEventFormAction} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="startsAt">Inicio (ISO local)</Label>
            <Input id="startsAt" name="startsAt" type="datetime-local" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="externalUrl">Enlace externo</Label>
            <Input id="externalUrl" name="externalUrl" type="url" placeholder="https://..." />
          </div>
          <Button type="submit">Crear evento</Button>
        </form>
      </Card>
    </div>
  );
}
