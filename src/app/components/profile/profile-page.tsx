import { useState, type FormEvent } from "react";
import {
  AtSign,
  Check,
  CreditCard,
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
import { toast } from "sonner";
import { PageHeader } from "../shared/page-header";
import { FadeIn } from "../shared/motion";
import { cardSurface } from "../shared/surface";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import {
  currentClass,
  currentStudent,
  currentUser,
} from "../../lib/mock-data";

export function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const fields: { icon: LucideIcon; label: string; value: string; mono?: boolean }[] = [
    { icon: UserIcon, label: "First Name", value: currentUser.f_name },
    { icon: UserIcon, label: "Last Name", value: currentUser.l_name },
    { icon: Mail, label: "Email", value: currentUser.email },
    { icon: Phone, label: "Mobile", value: currentUser.mobile, mono: true },
    { icon: CreditCard, label: "NIC", value: currentUser.nic, mono: true },
    { icon: Home, label: "Address", value: currentUser.address },
    { icon: School, label: "School", value: currentStudent.school },
    { icon: Hash, label: "Callup Number", value: currentStudent.callup_no, mono: true },
    { icon: GraduationCap, label: "Class", value: currentClass.class_name },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        subtitle="Your account details and security settings."
      />

      {/* Identity banner */}
      <FadeIn>
        <div className={cn(cardSurface, "flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:gap-5")}>
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary font-mono text-xl text-primary-foreground">
            {currentUser.f_name[0]}
            {currentUser.l_name[0]}
          </div>
          <div className="text-center sm:text-left">
            <p className="font-display text-xl tracking-tight">
              {currentUser.f_name} {currentUser.l_name}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {currentUser.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
                <Hash className="size-3.5" />
                {currentStudent.callup_no}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground">
                <GraduationCap className="size-3.5" />
                {currentClass.class_name}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="rounded-xl sm:ml-auto"
          >
            Sign out
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
                <h2 className="text-[1.0rem] tracking-tight">Profile Information</h2>
                <p className="text-xs text-muted-foreground">
                  Contact the office to update these details.
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

function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const mismatch = confirm.length > 0 && next !== confirm;
  const tooShort = next.length > 0 && next.length < 8;
  const valid =
    current.length > 0 && next.length >= 8 && next === confirm;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    // Mock — replace with real password-change request.
    setTimeout(() => {
      setSaving(false);
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password updated", {
        description: "Your password has been changed successfully.",
      });
    }, 900);
  }

  return (
    <form onSubmit={submit} className={cn(cardSurface, "flex h-full flex-col p-6")}>
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
          <KeyRound className="size-[18px]" />
        </div>
        <div>
          <h2 className="text-[1.0rem] tracking-tight">Change Password</h2>
          <p className="text-xs text-muted-foreground">
            Use at least 8 characters.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <PasswordField
          id="current"
          label="Current Password"
          value={current}
          onChange={setCurrent}
        />
        <PasswordField
          id="next"
          label="New Password"
          value={next}
          onChange={setNext}
          error={tooShort ? "Must be at least 8 characters" : undefined}
        />
        <PasswordField
          id="confirm"
          label="Confirm Password"
          value={confirm}
          onChange={setConfirm}
          error={mismatch ? "Passwords do not match" : undefined}
        />
      </div>

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
            Save Changes
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
          aria-invalid={!!error}
          className="h-11 rounded-xl pl-10"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
