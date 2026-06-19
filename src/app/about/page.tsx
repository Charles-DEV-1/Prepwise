import Image from "next/image";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="brand-blue-surface py-16">
        <div className="container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="text-5xl font-bold leading-tight tracking-normal text-navy">
              The modern AI-powered learning platform Nigerian students deserve.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Prepcore exists to make exam preparation clearer, calmer, and more
              effective for students preparing for JAMB, WAEC, and NECO.
            </p>
          </div>
          <Card className="soft-card">
            <CardContent className="p-6">
              <Image
                src="/brand/prepcore-flyer.png"
                alt="Prepcore student visual"
                width={900}
                height={650}
                className="h-80 rounded-3xl object-cover object-[72%_10%]"
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
