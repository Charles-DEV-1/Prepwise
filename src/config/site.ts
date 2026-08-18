function getAppUrl() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://www.prepcore.com.ng";
  const url = /^https?:\/\//i.test(appUrl) ? appUrl : `https://${appUrl}`;

  return url.replace(/\/$/, "");
}

export const siteConfig = {
  name: "Prepcore",
  formerName: "PassNow",
  url: getAppUrl(),
  description:
    "Free, fast exam preparation for Nigerian students studying for JAMB, WAEC, and NECO.",
  keywords: [
    "JAMB CBT practice",
    "WAEC past questions",
    "NECO past questions",
    "Nigerian exam preparation",
    "online mock exams Nigeria",
    "free exam practice",
    "AI study assistant",
    "exam preparation app",
    "study resources Nigeria",
    "exam prep platform",
    "mock exams online",
    "JAMB syllabus 2026",
    "JAMB past questions and answers.",
    "WAEC past questions and answers.",
    "NECO past questions and answers.",
    "JAMB CBT practice app",
    "WAEC past questions app",
    "NECO past questions app",
    "Nigerian exam prep app",
    "online mock exams Nigeria app",
    "free exam practice app",
    "AI study assistant app",
    "exam preparation app Nigeria",
    "study resources Nigeria app",
    "exam prep platform Nigeria",
    "mock exams online Nigeria",

  ],
};
