import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./../../lib/auth";
import Link from "next/link";
import LoginForm from "./LoginForm";
import {
  GraduationCap,
  Building2,
  GraduationCap as Student,
  Briefcase,
} from "lucide-react";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    if (session.user.user_type === 0) redirect("/admin");
    redirect("/user");
  }
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-border">
        <div className="flex flex-col">
          <Link href="/" className="flex items-center gap-2 mb-20">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">SkillChain</span>
          </Link>
          <div className="ietms-end">
            <h2 className="text-5xl font-bold leading-tight mb-4">
              Your credentials.
              <br />
              <span className="text-primary">Verified on-chain.</span>
            </h2>

            <p className="text-muted-foreground max-w-sm mb-16">
              Join the future of academic credentials. Secure, verifiable, and
              truly yours forever.
            </p>

            <div>
              <div className="flex items-center gap-6 mb-3">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Trusted by institutions, students & employers
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 SkillChain. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="text-base font-semibold">SkillChain</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
