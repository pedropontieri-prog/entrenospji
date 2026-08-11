import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pro/perfil")({
  ssr: false,
  component: ProProfilePage,
});

function ProProfilePage() {
  const { user, profile, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (nickname.trim().length < 2) throw new Error("curto");
      const { error } = await supabase
        .from("profiles")
        .update({ nickname: nickname.trim(), bio: bio.trim() || null })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Perfil atualizado.");
      await refresh();
    },
    onError: () => toast.error("Não conseguimos salvar seu perfil agora."),
  });

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Meu perfil profissional"
        description="Estas informações aparecem para as pessoas que buscam acompanhamento na plataforma."
      />

      <section className="card-soft p-6 sm:p-8">
        <div className="grid max-w-xl gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome-pro">Nome de exibição</Label>
            <Input
              id="nome-pro"
              value={nickname}
              maxLength={60}
              onChange={(event) => setNickname(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio-pro">Apresentação</Label>
            <Textarea
              id="bio-pro"
              value={bio}
              rows={5}
              maxLength={600}
              placeholder="Conte brevemente sobre sua abordagem e como você acolhe quem chega."
              onChange={(event) => setBio(event.target.value)}
              className="rounded-2xl text-base"
            />
            <p className="text-xs text-muted-foreground">{bio.length}/600 caracteres</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            className="min-h-12 rounded-full sm:px-8"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Salvar perfil
          </Button>
          <Button variant="ghost" className="min-h-12 rounded-full" onClick={handleSignOut}>
            <LogOut className="size-4" aria-hidden="true" />
            Sair da conta
          </Button>
        </div>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        Lembre-se: a plataforma exibe apenas o apelido dos pacientes e os registros que eles
        escolheram compartilhar.
      </p>
    </div>
  );
}
