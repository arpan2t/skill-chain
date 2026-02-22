import {
  Award,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  FileCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    label: "Certificates Issued",
    value: "1,284",
    change: "+12%",
    up: true,
    icon: Award,
  },
  {
    label: "Total Recipients",
    value: "946",
    change: "+8%",
    up: true,
    icon: Users,
  },
  {
    label: "Verifications",
    value: "3,721",
    change: "+24%",
    up: true,
    icon: ShieldCheck,
  },
  {
    label: "Active This Month",
    value: "187",
    change: "+5%",
    up: true,
    icon: TrendingUp,
  },
];

const recentActivity = [
  {
    id: 1,
    type: "issued",
    name: "Blockchain Fundamentals",
    recipient: "Alex Johnson",
    time: "2 min ago",
    icon: Award,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: 2,
    type: "verified",
    name: "Advanced Solidity",
    recipient: "Maria Garcia",
    time: "14 min ago",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    id: 3,
    type: "pending",
    name: "DeFi Certification",
    recipient: "James Lee",
    time: "1 hr ago",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    id: 4,
    type: "issued",
    name: "Web3 Development",
    recipient: "Priya Sharma",
    time: "3 hr ago",
    icon: FileCheck,
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back — here's what's happening on SkillChain.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Activity
            </h2>
            <button className="text-xs text-primary hover:underline">
              View all
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.bg}`}
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.recipient}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Quick Actions
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Issue New Certificate", icon: Award, primary: true },
              { label: "Verify a Certificate", icon: ShieldCheck },
              { label: "Manage Recipients", icon: Users },
            ].map((action) => (
              <button
                key={action.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  action.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                <action.icon className="w-4 h-4 shrink-0" />
                {action.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="px-5 pb-4">
            <div className="rounded-lg bg-secondary border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Blockchain Network
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-foreground">
                  Solana Devnet
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
