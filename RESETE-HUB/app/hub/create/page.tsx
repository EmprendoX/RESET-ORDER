import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireCreateAccess } from "@/lib/auth/guards";
import { CreatePostForm } from "@/components/create-post-form";

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ space?: string }>;
}) {
  await requireCreateAccess();
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: spaces } = await supabase
    .from("spaces")
    .select("id, name, only_admin_posts")
    .eq("is_archived", false)
    .order("name");

  const list = (spaces ?? []).map((s) => ({ id: s.id as string, name: s.name as string }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Nuevo post</h1>
      <Card>
        <CreatePostForm spaces={list} defaultSpaceId={sp.space} />
      </Card>
    </div>
  );
}
