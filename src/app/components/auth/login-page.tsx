import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Loader2, Sigma } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { softShadow } from "../shared/surface";
import { cn } from "../ui/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("sahan.w@gmail.com");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Mock auth — replace with real authentication call.
    setTimeout(onLogin, 850);
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left — brand panel (desktop) */}
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.12),transparent_40%)]" />
        {/* faint grid */}
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:46px_46px]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Sigma className="size-5" strokeWidth={2.2} />
            </div>
            <span className="font-display text-lg tracking-tight">AxiomMaths</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="max-w-md space-y-5"
          >
            <p className="font-display text-[2rem] leading-tight tracking-tight">
              Master Combined Maths, one paper at a time.
            </p>
            <p className="text-[0.95rem] leading-relaxed text-primary-foreground/80">
              Your materials, marks and rank — in one calm, focused workspace.
              Built for serious A/L candidates.
            </p>
            <div className="flex items-center gap-6 pt-4">
              {[
                { v: "1,200+", l: "Students" },
                { v: "98%", l: "A/L pass rate" },
                { v: "15 yrs", l: "Teaching" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-mono text-xl tracking-tight">{s.v}</p>
                  <p className="text-xs text-primary-foreground/70">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <p className="text-xs text-primary-foreground/60">
            © 2026 AxiomMaths Institute · Maharagama
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center bg-background px-5 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sigma className="size-5" strokeWidth={2.2} />
            </div>
            <span className="font-display text-lg tracking-tight">AxiomMaths</span>
          </div>

          <h1 className="text-[1.6rem] tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your student portal to continue.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-primary transition-opacity hover:opacity-70"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPw ? (
                    <EyeOff className="size-[18px]" />
                  ) : (
                    <Eye className="size-[18px]" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={cn("h-11 w-full rounded-xl", softShadow)}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setLoading(true);
              setTimeout(onLogin, 850);
            }}
            disabled={loading}
            className="h-11 w-full rounded-xl"
          >
            <GoogleIcon />
            Sign in with Google
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New to the institute?{" "}
            <button className="text-primary transition-opacity hover:opacity-70">
              Contact the office
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
