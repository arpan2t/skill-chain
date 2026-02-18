import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./../../lib/auth";
import Link from "next/link";
import RegisterForm from "./RegisterForm";
import { GraduationCap, Building2, Briefcase } from "lucide-react";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    if (session.user.user_type === 0) redirect("/admin/issue");
    redirect("/user");
  }

  return (
    <div className="min-h-screen pt-16 flex bg-background text-foreground">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-border">
        <div className="">
          <h2 className="text-5xl font-bold leading-tight mb-4">
            Start your journey.
            <br />
            <span className="text-primary">Build your future.</span>
          </h2>

          <p className="text-muted-foreground max-w-sm mb-16">
            Create your account and get access to blockchain-verified
            credentials that last forever.
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

        <p className="text-xs text-muted-foreground">
          © 2026 SkillChain. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <RegisterForm />
    </div>
  );
}
