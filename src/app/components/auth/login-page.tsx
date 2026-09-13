import { useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Loader2, Sigma } from "lucide-react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  type AuthCredential,
} from "firebase/auth";
import { toast } from "sonner";
import { auth, googleProvider } from "../../lib/firebase";
import { firebaseLogin, type LoginResult } from "../../lib/api";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { softShadow } from "../shared/surface";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";

const easeOut = [0.22, 1, 0.36, 1] as const;

// Friendly messages for common auth failures
const friendlyAuthError = (
  error: any,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string => {
  // Backend rejection — e.g. the Google account isn't linked to a student record
  const status = error?.response?.status;
  if (status === 404) {
    return t("login.errors.notRegistered");
  }
  const backendMsg = error?.response?.data?.msg;
  if (backendMsg) return backendMsg;

  switch (error?.code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return t("login.errors.wrongCredentials");
    case "auth/user-not-found":
      return t("login.errors.userNotFound");
    case "auth/invalid-email":
      return t("login.errors.invalidEmail");
    case "auth/too-many-requests":
      return t("login.errors.tooManyAttempts");
    case "auth/network-request-failed":
      return t("login.errors.network");
    case "auth/popup-blocked":
      return t("login.errors.popupBlocked");
    case "auth/popup-closed-by-user":
      return t("login.errors.popupClosed");
    case "auth/cancelled-popup-request":
      return t("login.errors.cancelled");
    case "auth/unauthorized-domain":
      return t("login.errors.unauthorizedDomain");
    case "auth/operation-not-allowed":
      return t("login.errors.googleDisabled");
    case "auth/account-exists-with-different-credential":
      return t("login.errors.accountExists");
    default:
      return error?.message ?? t("login.errors.failed");
  }
};

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // When Google sign-in is blocked because a password account with the same
  // email exists, keep the Google credential and link it after password login.
  const pendingGoogleCred = useRef<AuthCredential | null>(null);

  // Backend JWT exchange → persist session → enter the app.
  // No refresh token — one long-lived JWT kept in localStorage.
  const finishLogin = (res: LoginResult) => {
    if (!res?.success || !res.data?.token) {
      setErr(res?.msg ?? t("login.errors.failed"));
      return;
    }
    // This portal is for students only — staff/admin JWTs are rejected here
    // (the backend also rejects their data calls).
    if (res.data.user?.roles && res.data.user.roles !== "student") {
      setErr(t("login.studentsOnly"));
      return;
    }
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    const user = res.data.user;
    const name = user ? `${user.first_name} ${user.last_name}`.trim() : "";
    toast.success(
      name
        ? t("login.welcomeToast", { name })
        : t("login.welcomeToastNoName"),
    );
    onLogin();
  };

  // Email + password login
  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // Link a Google credential blocked earlier, so Google login works next time
      if (pendingGoogleCred.current) {
        try {
          await linkWithCredential(userCred.user, pendingGoogleCred.current);
          console.log("Linked Google account to existing password account.");
        } catch (linkErr: any) {
          console.warn("Google account linking skipped:", linkErr?.code ?? linkErr);
        }
        pendingGoogleCred.current = null;
      }

      const idToken = await userCred.user.getIdToken();
      finishLogin(await firebaseLogin(idToken));
    } catch (error: any) {
      console.error("Password login failed:", error);
      setErr(friendlyAuthError(error, t));
    } finally {
      setLoading(false);
    }
  }

  // Google login
  async function googleLogin() {
    setErr("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign-in response:", result);

      // Debug: the raw Google OAuth credential (its idToken is a Google token,
      // NOT what the backend verifies)
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) console.log("Google OAuth credential:", credential);

      // The backend verifies a Firebase Auth ID token, so take it from the
      // signed-in user. No refresh token — just this single access token.
      const idToken = await result.user.getIdToken();
      finishLogin(await firebaseLogin(idToken));
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      const credential = GoogleAuthProvider.credentialFromError(error);
      if (credential) console.log("Google credential from error:", credential);

      // Email already registered with a password — stash the credential,
      // prefill the form and point the user at the password login.
      if (error?.code === "auth/account-exists-with-different-credential") {
        pendingGoogleCred.current = credential ?? null;
        const accountEmail: string | undefined =
          error?.customData?.email || error?.email;
        if (typeof accountEmail === "string" && accountEmail) {
          setEmail(accountEmail);
          try {
            const methods = await fetchSignInMethodsForEmail(auth, accountEmail);
            console.log("Sign-in methods for", accountEmail, ":", methods);
          } catch (methodsErr) {
            console.warn("Could not fetch sign-in methods:", methodsErr);
          }
        }
      }

      setErr(friendlyAuthError(error, t));
    } finally {
      setLoading(false);
    }
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
            <span className="font-display text-lg tracking-tight">CombinedMaths</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="max-w-md space-y-5"
          >
            <p className="font-display text-[2rem] leading-tight tracking-tight">
              {t("login.heroTitle")}
            </p>
            <p className="text-[0.95rem] leading-relaxed text-primary-foreground/80">
              {t("login.heroBody")}
            </p>
            <div className="flex items-center gap-6 pt-4">
              {[
                { v: "1,200+", l: t("login.statStudents") },
                { v: "98%", l: t("login.statPassRate") },
                {
                  v: t("login.statTeachingValue"),
                  l: t("login.statTeachingLabel"),
                },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-mono text-xl tracking-tight">{s.v}</p>
                  <p className="text-xs text-primary-foreground/70">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <p className="text-xs text-primary-foreground/60">
            © 2026 ComMaths Institute · Kaluthara | Mathugama | Horana
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

          <h1 className="text-[1.6rem] tracking-tight">
            {t("login.welcomeBack")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("login.subtitle")}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder")}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("login.password")}</Label>
                <button
                  type="button"
                  className="text-xs text-primary transition-opacity hover:opacity-70"
                >
                  {t("login.forgotPassword")}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={
                    showPw ? t("login.hidePassword") : t("login.showPassword")
                  }
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

            {err && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2.5 text-xs leading-relaxed text-destructive">
                {err}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={cn("h-11 w-full rounded-xl", softShadow)}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  {t("login.signIn")}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              {t("login.orContinueWith")}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={googleLogin}
            disabled={loading}
            className="h-11 w-full rounded-xl"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {t("login.signInWithGoogle")}
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("login.newHere")}{" "}
            <button className="text-primary transition-opacity hover:opacity-70">
              {t("login.contactOffice")}
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
