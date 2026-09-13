import { useEffect, useState, type FormEvent } from "react";
import {
  AtSign,
  Check,
  Clock,
  GraduationCap,
  Hash,
  Home,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  type LucideIcon,
  Phone,
  School,
  User as UserIcon,
} from "lucide-react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { toast } from "sonner";
import { auth } from "../../lib/firebase";
import { getStudentProfile, type StudentProfile } from "../../lib/api";
import { useI18n } from "../../lib/i18n";
import { PageHeader } from "../shared/page-header";
import { FadeIn } from "../shared/motion";
import { cardSurface } from "../shared/surface";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

export function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const { t } = useI18n();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  // GET /api/students/profile/:userId (userId from the stored login user)
  const load = async () => {
    setLoading(true);
    setLoadErr("");
    try {
      setProfile(await getStudentProfile());
    } catch (error: any) {
      console.error("Profile load failed:", error);
      setLoadErr(
        error?.response?.data?.msg ??
          error?.message ??
          t("profile.loadError")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={t("profile.title")}
          subtitle={t("profile.subtitle")}
        />
        <div className={cn(cardSurface, "flex items-center justify-center p-16")}>
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={t("profile.title")}
          subtitle={t("profile.subtitle")}
        />
        <div
          className={cn(
            cardSurface,
            "flex flex-col items-center gap-4 p-16 text-center"
          )}
        >
          <p className="text-sm text-destructive">
            {loadErr || t("profile.loadError")}
          </p>
          <Button variant="outline" onClick={load} className="rounded-xl">
            {t("common.tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  const u = profile.user;
  // Fallbacks ("—") guard against incomplete records from the backend
  const batch = profile.batch;
  const fields: { icon: LucideIcon; label: string; value: string; mono?: boolean }[] = [
    { icon: UserIcon, label: t("profile.fields.firstName"), value: u.first_name || "—" },
    { icon: UserIcon, label: t("profile.fields.lastName"), value: u.last_name || "—" },
    { icon: Mail, label: t("profile.fields.email"), value: u.email || "—" },
    { icon: Phone, label: t("profile.fields.mobile"), value: u.mobile || "—", mono: true },
    { icon: Home, label: t("profile.fields.address"), value: u.address || "—" },
    { icon: School, label: t("profile.fields.school"), value: profile.school || "—" },
    { icon: Hash, label: t("profile.fields.callupNumber"), value: profile.call_up_no || "—", mono: true },
    {
      icon: GraduationCap,
      label: t("profile.fields.class"),
      value: batch ? batch.name : "—",
    },
    {
      icon: Clock,
      label: t("profile.fields.classSchedule"),
      value: batch ? `${batch.day} · ${batch.start_time} – ${batch.end_time}` : "—",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("profile.title")}
        subtitle={t("profile.subtitle")}
      />

      {/* Identity banner */}
      <FadeIn>
        <div className={cn(cardSurface, "flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:gap-5")}>
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary font-mono text-xl text-primary-foreground">
            {(u.first_name?.[0] ?? "?")}
            {(u.last_name?.[0] ?? "?")}
          </div>
          <div className="text-center sm:text-left">
            <p className="font-display text-xl tracking-tight">
              {u.first_name} {u.last_name}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {u.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
                <Hash className="size-3.5" />
                {profile.call_up_no}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground">
                <GraduationCap className="size-3.5" />
                {profile.batch.name}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="rounded-xl sm:ml-auto"
          >
            {t("common.signOut")}
          </Button>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Profile information */}
        <FadeIn delay={0.04} className="lg:col-span-3">
          <div className={cn(cardSurface, "p-6")}>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
                <AtSign className="size-[18px]" />
              </div>
              <div>
                <h2 className="text-[1.0rem] tracking-tight">
                  {t("profile.information")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("profile.informationHint")}
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <f.icon className="size-3.5" />
                    {f.label}
                  </dt>
                  <dd
                    className={cn(
                      "text-foreground",
                      f.mono && "font-mono tabular-nums",
                    )}
                  >
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </FadeIn>

        {/* Change password */}
        <FadeIn delay={0.08} className="lg:col-span-2">
          <ChangePasswordCard />
        </FadeIn>
      </div>
    </div>
  );
}

// Friendly messages for password-change failures
const friendlyPasswordError = (error: any, t: (key: string) => string): string => {
  switch (error?.code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return t("profile.errors.wrongCurrent");
    case "auth/weak-password":
      return t("profile.errors.weak");
    case "auth/too-many-requests":
      return t("profile.errors.tooManyAttempts");
    case "auth/requires-recent-login":
      return t("profile.errors.recentLogin");
    case "auth/network-request-failed":
      return t("profile.errors.network");
    default:
      return error?.message ?? t("profile.errors.failed");
  }
};

function ChangePasswordCard() {
  const { t } = useI18n();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const mismatch = confirm.length > 0 && next !== confirm;
  const tooShort = next.length > 0 && next.length < 8;
  const valid =
    current.length > 0 && next.length >= 8 && next === confirm;

  // No backend endpoint needed here: Firebase client-side re-auth verifies the
  // CURRENT password (the Admin SDK cannot), then updates it directly.
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setErr("");
    try {
      const fbUser = auth.currentUser;
      if (!fbUser || !fbUser.email) {
        setErr(t("profile.errors.sessionExpired"));
        return;
      }

      // 1. Re-authenticate with the current password (verifies it)
      const cred = EmailAuthProvider.credential(fbUser.email, current);
      await reauthenticateWithCredential(fbUser, cred);
      // 2. Set the new password
      await updatePassword(fbUser, next);

      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success(t("profile.updated"), {
        description: t("profile.updatedBody"),
      });
    } catch (error: any) {
      console.error("Password change failed:", error);
      setErr(friendlyPasswordError(error, t));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className={cn(cardSurface, "flex h-full flex-col p-6")}>
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
          <KeyRound className="size-[18px]" />
        </div>
        <div>
          <h2 className="text-[1.0rem] tracking-tight">
            {t("profile.changePassword")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("profile.changePasswordHint")}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <PasswordField
          id="current"
          label={t("profile.currentPassword")}
          value={current}
          onChange={setCurrent}
        />
        <PasswordField
          id="next"
          label={t("profile.newPassword")}
          value={next}
          onChange={setNext}
          error={tooShort ? t("profile.tooShort") : undefined}
        />
        <PasswordField
          id="confirm"
          label={t("profile.confirmPassword")}
          value={confirm}
          onChange={setConfirm}
          error={mismatch ? t("profile.mismatch") : undefined}
        />
      </div>

      {err && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2.5 text-xs leading-relaxed text-destructive">
          {err}
        </p>
      )}

      <Button
        type="submit"
        disabled={!valid || saving}
        className="mt-6 w-full rounded-xl sm:mt-auto"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <Check className="size-4" />
            {t("profile.save")}
          </>
        )}
      </Button>
    </form>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={id === "current" ? "current-password" : "new-password"}
          minLength={8}
          aria-invalid={!!error}
          className="h-11 rounded-xl pl-10"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
