import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#358eb8] flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SkillChain</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Your credentials.
            <br />
            <span className="text-[#358eb8]">Verified on-chain.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Join the future of academic credentials. Secure, verifiable, and
            truly yours forever.
          </p>

          <div className="flex items-center gap-6 pt-8">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#358eb8] border-2 border-slate-900 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#4aa3cc] border-2 border-slate-900 flex items-center justify-center">
                <Student className="w-5 h-5 text-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#2a7296] border-2 border-slate-900 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-slate-500 text-sm">
              Trusted by institutions, students & employers
            </p>
          </div>
        </div>

        <p className="text-slate-600 text-sm">
          © 2026 SkillChain. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <LoginForm />
    </div>
  );
}
