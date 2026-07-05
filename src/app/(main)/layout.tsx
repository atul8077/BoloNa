import { Topbar } from "@/components/layout/Topbar";
import { GlobalMessageListener } from "@/components/GlobalMessageListener";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--background)] pb-16 md:pb-0">
      <GlobalMessageListener />
      <Topbar />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
