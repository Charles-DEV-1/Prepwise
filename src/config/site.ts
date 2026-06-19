function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return /^https?:\/\//i.test(appUrl) ? appUrl : `https://${appUrl}`;
}

export const siteConfig = {
  name: "Prepcore",
  formerName: "PassNow",
  url: getAppUrl(),
  description:
    "Free, fast exam preparation for Nigerian students studying for JAMB, WAEC, and NECO.",
};
