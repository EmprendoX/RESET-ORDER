import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createResourceFormAction } from "@/lib/actions/resources";

export default function AdminResourcesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recursos</h1>
      <Card className="space-y-3">
        <h2 className="font-semibold">Nuevo recurso</h2>
        <form action={createResourceFormAction} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="category">Categoría</Label>
            <Input id="category" name="category" required placeholder="Guías, Plantillas..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="url">URL (opcional)</Label>
            <Input id="url" name="url" type="url" placeholder="https://..." />
          </div>
          <Button type="submit">Publicar recurso</Button>
        </form>
      </Card>
    </div>
  );
}
