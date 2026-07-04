import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] text-white overflow-hidden relative">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)] rounded-full blur-[120px] opacity-30 mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--secondary)] rounded-full blur-[120px] opacity-30 mix-blend-screen" />

      <div className="z-10 flex flex-col items-center text-center px-4 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Meet. Chat. Call. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">Connect.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl">
          Join BoloNa today. The premium social networking platform designed for meaningful connections.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-lg rounded-full px-8 py-6 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] border-none hover:opacity-90">
              Get Started
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg rounded-full px-8 py-6 border-white/20 text-white hover:bg-white/10 hover:text-white bg-white/5 backdrop-blur-sm">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
