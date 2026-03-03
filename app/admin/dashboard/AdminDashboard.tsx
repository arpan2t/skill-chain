"use client";

import { useRouter } from "next/navigation";
import {
  Award,
  Users,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Clock,
  CheckCircle2,
  Bell,
} from "lucide-react";

const iconMap: { [key: string]: any } = {
  Award,
  Users,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Clock,
  CheckCircle2,
  Bell,
};

interface Stat {
  label: string;
  value: string;
  iconName: string;
}

interface Activity {
  id: number;
  type: string;
  name: string;
  recipient: string;
  time: string;
  iconName: string;
  color: string;
  bg: string;
}

interface QuickAction {
  label: string;
  iconName: string;
  primary?: boolean;
  warning?: boolean;
  href: string;
}

interface AdminDashboardClientProps {
  stats: Stat[];
  recentActivity: Activity[];
  quickActions: QuickAction[];
}

export default function AdminDashboardClient({
  stats,
  recentActivity,
  quickActions,
}: AdminDashboardClientProps) {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page heading with notification badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back — here's what's happening on your platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.iconName];
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Activity
            </h2>
            <button
              onClick={() => router.push("/admin/issued/certificates")}
              className="text-xs text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => {
                const Icon = iconMap[item.iconName];
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/admin/certificates/${item.id}`)
                    }
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.bg}`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Recipient: {item.recipient}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.time}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Quick Actions
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {quickActions.map((action) => {
              const Icon = iconMap[action.iconName];
              return (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    action.primary
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                      : action.warning
                        ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {action.label}
                </button>
              );
            })}
          </div>

          {/* Network Status */}
          <div className="px-5 pb-4">
            <div className="rounded-lg bg-secondary/50 border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Blockchain Network
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-foreground">
                  Solana Devnet
                </span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="block">Connected • Synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">
            Today's Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Certificates Issued
              </span>
              <span className="text-sm font-medium">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Verifications
              </span>
              <span className="text-sm font-medium">48</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                New Recipients
              </span>
              <span className="text-sm font-medium">8</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">API Status</span>
              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Blockchain</span>
              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Database</span>
              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Healthy
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">
            Quick Tips
          </h3>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              • Certificates are minted on Solana Devnet
            </p>
            <p className="text-xs text-muted-foreground">
              • Use the revocation system for invalid credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
