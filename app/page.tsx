import { WalletButton } from "./components/WalletButton";
import { GraduationCap, Shield, Zap, Globe, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">SkillChain</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="hover:text-foreground transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>
          <WalletButton />
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-28 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-6">
            Powered by Solana
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Your Skills.
            <br />
            <span className="text-primary">Verified Forever.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mb-10">
            Secure, verifiable academic credentials that are truly yours.
          </p>
          <div className="flex items-center gap-4">
            <WalletButton />
            <a
              href="#features"
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-border text-secondary-foreground hover:bg-secondary transition-colors flex items-center gap-2"
            >
              Explore <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Why SkillChain?
          </h2>
          <p className="text-muted-foreground mb-14 max-w-md">
            A new standard for digital credentials.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Tamper-Proof",
                desc: "Credentials stored on-chain can never be altered or forged.",
              },
              {
                icon: Zap,
                title: "Instant Verification",
                desc: "Verify any credential in seconds, not days.",
              },
              {
                icon: Globe,
                title: "Truly Portable",
                desc: "Your achievements follow you, wherever you go.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <Icon className="w-5 h-5 text-primary mb-4" />
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 bg-secondary">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Built for the Future
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-10">
            SkillChain leverages Solana's high-speed blockchain to create a
            seamless experience for issuing and verifying academic credentials.
            Whether you're an institution or a professional, SkillChain has you
            covered.
          </p>
          <div className="flex gap-12">
            <div>
              <div className="text-xl font-bold">Secure</div>
              <div className="text-xs text-muted-foreground">
                Blockchain-backed
              </div>
            </div>
            <div>
              <div className="text-xl font-bold">Fast</div>
              <div className="text-xs text-muted-foreground">
                Sub-second finality
              </div>
            </div>
            <div>
              <div className="text-xl font-bold">Affordable</div>
              <div className="text-xs text-muted-foreground">Minimal fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Get Started Today
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Connect your wallet and experience verifiable credentials.
          </p>
          <WalletButton />
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-10 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">SkillChain</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 SkillChain. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Discord
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
