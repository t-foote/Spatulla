import { Film } from "lucide-react";
import { UploadForm } from "@/components/upload-form";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Spatulla</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Turn images into a video prompt. 
          </p>
        </header>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/30 sm:p-8">
          <UploadForm />
        </div>

        <footer className="text-center text-xs text-muted-foreground">
          
        </footer>
      </div>
    </main>
  );
}
