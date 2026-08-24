import Image from "next/image";
import type { Metadata } from "next";
import { Linkedin } from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Prepcore",
  description:
    "Learn how Prepcore helps Nigerian students prepare confidently for JAMB, WAEC, and NECO with focused digital study tools.",
  alternates: { canonical: "/about" },
};

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
                src="/Prepcore_app_logo_design_202606131935.jpeg"
                alt="Prepcore student visual"
                width={900}
                height={650}
                className="h-80 rounded-3xl object-cover object-[72%_10%]"
              />
            </CardContent>
          </Card>
        </div>
        <section className="container mt-16">
          <Card className="soft-card mx-auto max-w-4xl">
            <CardContent className="p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Founder, CEO & Owner
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy">Charles Ozebo</h2>
              <p className="mt-2 text-sm font-semibold text-primary">
                Founder, Chief Executive Officer, and Owner of Prepcore
              </p>
              <div className="mt-5 max-w-3xl space-y-4 text-base leading-8 text-slate-600">
                <p>
                  Charles Ozebo is the founder, Chief Executive Officer (CEO), and owner of Prepcore. He is a Computer Science student and software engineer passionate about technology, education, and building solutions that solve real-world problems. He created Prepcore after recognizing the challenges many Nigerian students face when preparing for JAMB and WAEC.
                </p>
                <p>
                  With a focus on software development and product innovation, Charles is committed to using technology to make learning more accessible, engaging, and effective for students. Through Prepcore, he aims to build a platform that not only helps students practice but also gives them the tools and confidence to perform better in their examinations.
                </p>
              </div>
              <a
                href="https://www.linkedin.com/in/ozebo-charles-b88471343/"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[#0A66C2]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#0A66C2] transition hover:-translate-y-0.5 hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5"
              >
                <Linkedin className="h-4 w-4" />
                Connect with Charles on LinkedIn
              </a>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
