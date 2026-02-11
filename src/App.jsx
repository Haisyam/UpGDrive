import UploadCard from "@/components/uploader/UploadCard";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-28 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <header className="absolute right-4 top-4 z-10 md:right-6 md:top-6">
        <ThemeToggle />
      </header>

      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <UploadCard />
      </main>

      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}

export default App;
