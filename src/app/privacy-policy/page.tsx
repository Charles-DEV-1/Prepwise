import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Prepcore collects, uses, protects, and manages personal information.",
  alternates: { canonical: "/privacy-policy" },
};

const contactEmail = "prepcoreng@gmail.com";

const informationWeCollect = [
  "Full name",
  "Email address",
  "Phone number",
  "Account and authentication information",
  "Examination preferences such as JAMB or WAEC",
  "Selected subjects and learning preferences",
  "Practice and examination activity",
  "Scores and learning progress",
  "Streaks, points and leaderboard information",
  "Feedback submitted through Prepcore",
  "Referral activity",
  "Subscription and payment-related information",
  "Information relating to reports submitted about questions",
  "Device and technical information necessary to operate and secure the service",
  "Information automatically generated when you use the website or application",
];

const howWeUseInformation = [
  "Create and manage your Prepcore account",
  "Provide practice questions, mock examinations and other learning features",
  "Save your learning progress",
  "Calculate scores, streaks, points and rankings",
  "Provide personalised learning experiences",
  "Process subscriptions and payments",
  "Manage referral programmes",
  "Respond to feedback, reports and support requests",
  "Improve Prepcore's features and user experience",
  "Detect abuse, fraud, security threats and other harmful activity",
  "Maintain and improve the reliability and security of our services",
  "Communicate important information about your account or the service",
];

const privacyRights = [
  "Request access to personal information we hold about you",
  "Request correction of inaccurate information",
  "Request deletion of certain information",
  "Object to or request restriction of certain processing",
  "Request information about how your data is being processed",
  "Withdraw consent where processing is based on consent",
];

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={title} className="scroll-mt-24">
      <h2
        id={title}
        className="text-2xl font-bold tracking-normal text-navy sm:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-8 text-slate-600">
        {children}
      </div>
    </section>
  );
}

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-primary">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="brand-blue-surface py-12 sm:py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <header className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Legal
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-normal text-navy sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Last Updated: September 1, 2026
              </p>
            </header>

            <Card className="soft-card mt-8 sm:mt-10">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="space-y-10">
                  <p className="text-base leading-8 text-slate-600">
                    Prepcore (&quot;Prepcore&quot;, &quot;we&quot;,
                    &quot;us&quot;, or &quot;our&quot;) respects your privacy
                    and is committed to protecting the personal information of
                    users who use our website, web application, and related
                    services.
                  </p>
                  <p className="-mt-6 text-base leading-8 text-slate-600">
                    This Privacy Policy explains what information we collect,
                    why we collect it, how we use it, and the choices available
                    to you.
                  </p>

                  <PolicySection title="1. Information We Collect">
                    <p>
                      Depending on how you use Prepcore, we may collect
                      information such as:
                    </p>
                    <PolicyList items={informationWeCollect} />
                    <p>
                      We only collect information that is reasonably necessary
                      for providing and improving Prepcore.
                    </p>
                  </PolicySection>

                  <PolicySection title="2. How We Use Your Information">
                    <p>We may use collected information to:</p>
                    <PolicyList items={howWeUseInformation} />
                    <p>
                      We do not sell your personal information simply because
                      you use Prepcore.
                    </p>
                  </PolicySection>

                  <PolicySection title="3. Account Information">
                    <p>
                      When you create an account, certain information is
                      required to provide the service.
                    </p>
                    <p>
                      You are responsible for ensuring that the information you
                      provide is accurate and for keeping your account
                      credentials secure.
                    </p>
                  </PolicySection>

                  <PolicySection title="4. Learning and Usage Data">
                    <p>
                      Prepcore may store information about how you use the
                      platform, including practice sessions, examination
                      sessions, scores, answers, progress, streaks, points and
                      related activity.
                    </p>
                    <p>
                      This information allows us to provide features such as
                      progress tracking, rankings and personalised learning
                      experiences.
                    </p>
                  </PolicySection>

                  <PolicySection title="5. Payments">
                    <p>
                      Payments for Prepcore services may be processed through
                      third-party payment providers.
                    </p>
                    <p>
                      Prepcore does not need to store your complete card or
                      banking credentials when those details are handled
                      directly by the relevant payment provider.
                    </p>
                    <p>
                      Payment-related information may be retained where
                      necessary for transaction records, subscription
                      management, fraud prevention, customer support and legal
                      or accounting purposes.
                    </p>
                  </PolicySection>

                  <PolicySection title="6. Referrals">
                    <p>
                      If you participate in the Prepcore referral programme, we
                      may collect and process information necessary to track
                      referrals, signups, conversions, rewards and commissions.
                    </p>
                    <p>
                      Referral information is used to operate and administer the
                      programme.
                    </p>
                  </PolicySection>

                  <PolicySection title="7. Feedback">
                    <p>
                      If you submit feedback, ratings, comments, suggestions or
                      reports through Prepcore, we may store that information
                      together with relevant account or usage information needed
                      to understand and respond to the feedback.
                    </p>
                    <p>We may use feedback to improve Prepcore.</p>
                  </PolicySection>

                  <PolicySection title="8. Cookies and Similar Technologies">
                    <p>
                      Prepcore may use cookies, local storage, session storage
                      or similar technologies where necessary for
                      authentication, security, preferences, functionality and
                      improving the user experience.
                    </p>
                    <p>
                      Where applicable, users may be given choices regarding
                      non-essential cookies or similar technologies.
                    </p>
                  </PolicySection>

                  <PolicySection title="9. Third-Party Services">
                    <p>
                      Prepcore may use third-party services to provide certain
                      parts of the platform, including infrastructure,
                      authentication, database services, analytics, payment
                      processing, notifications, email delivery and other
                      technical services.
                    </p>
                    <p>
                      These providers may process information on our behalf
                      where necessary to provide their services.
                    </p>
                    <p>
                      We aim to use reputable service providers and take
                      reasonable steps to protect information shared with them.
                    </p>
                  </PolicySection>

                  <PolicySection title="10. Data Security">
                    <p>
                      We take reasonable technical and organisational measures
                      to protect personal information against unauthorised
                      access, loss, misuse, alteration or disclosure.
                    </p>
                    <p>
                      However, no internet-based service can guarantee absolute
                      security.
                    </p>
                  </PolicySection>

                  <PolicySection title="11. Data Retention">
                    <p>
                      We retain personal information for as long as reasonably
                      necessary to provide our services, maintain account
                      functionality, comply with legal obligations, resolve
                      disputes, enforce agreements and maintain legitimate
                      business records.
                    </p>
                    <p>
                      Where information is no longer necessary, we may delete or
                      anonymise it where appropriate.
                    </p>
                  </PolicySection>

                  <PolicySection title="12. Your Privacy Rights">
                    <p>
                      Depending on applicable law, you may have rights relating
                      to your personal information, including the right to:
                    </p>
                    <PolicyList items={privacyRights} />
                    <p>To make a privacy-related request, contact:</p>
                    <p>
                      <a
                        className="font-semibold text-primary underline underline-offset-4 hover:text-navy"
                        href={`mailto:${contactEmail}`}
                      >
                        {contactEmail}
                      </a>
                    </p>
                    <p>
                      We may need to verify your identity before processing
                      certain requests.
                    </p>
                  </PolicySection>

                  <PolicySection title="13. Children's Privacy">
                    <p>
                      Prepcore is an educational platform intended primarily for
                      students preparing for examinations.
                    </p>
                    <p>
                      If you are under the age required to provide valid consent
                      under applicable law, you should use Prepcore with the
                      involvement of a parent, guardian or other responsible
                      adult where required.
                    </p>
                    <p>
                      We do not knowingly seek to collect unnecessary personal
                      information from children.
                    </p>
                  </PolicySection>

                  <PolicySection title="14. Changes to This Privacy Policy">
                    <p>
                      We may update this Privacy Policy from time to time as
                      Prepcore develops, our services change, or applicable
                      privacy requirements change.
                    </p>
                    <p>
                      When we make material changes, we will update the
                      &quot;Last Updated&quot; date on this page.
                    </p>
                  </PolicySection>

                  <PolicySection title="15. Contact Us">
                    <p>
                      If you have questions, concerns or requests regarding this
                      Privacy Policy or your personal information, contact us
                      at:
                    </p>
                    <p>
                      <a
                        className="font-semibold text-primary underline underline-offset-4 hover:text-navy"
                        href={`mailto:${contactEmail}`}
                      >
                        {contactEmail}
                      </a>
                    </p>
                  </PolicySection>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
