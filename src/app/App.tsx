import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { LoginPage } from "./components/auth/login-page";
import { AppShell } from "./components/layout/app-shell";
import { DashboardPage } from "./components/dashboard/dashboard-page";
import { MaterialsPage } from "./components/materials/materials-page";
import { PerformancePage } from "./components/performance/performance-page";
import { ProfilePage } from "./components/profile/profile-page";
import { PdfViewerPage } from "./components/viewer/pdf-viewer-page";
import { VideoPlayerPage } from "./components/viewer/video-player-page";
import { DeactivatedView } from "./components/shared/deactivated-view";
import { autoLogin, isDeactivatedError } from "./lib/api";
import type { PageKey } from "./components/layout/nav";
import type { Material } from "./lib/types";

interface ViewerState {
  type: "pdf" | "video";
  material: Material;
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [deactivated, setDeactivated] = useState(false);
  const [page, setPage] = useState<PageKey>("dashboard");
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  // Any API call answered with "Deactivated Student" (403 from the backend's
  // active-account middleware) flips the whole portal to the deactivated view.
  useEffect(() => {
    const onDeactivated = () => setDeactivated(true);
    window.addEventListener("student-deactivated", onDeactivated);
    return () => window.removeEventListener("student-deactivated", onDeactivated);
  }, []);

  // Autologin: restore the session from the JWT in localStorage on load
  useEffect(() => {
    const restoreSession = async () => {
      if (!localStorage.getItem("token")) {
        setAuthLoading(false);
        return;
      }
      try {
        const res = await autoLogin();
        if (res?.success) {
          // Drop staff/admin sessions — this portal is for students only and
          // the backend rejects their data calls anyway.
          const raw = localStorage.getItem("user");
          const stored = raw ? JSON.parse(raw) : null;
          if (stored?.roles && stored.roles !== "student") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          } else {
            setAuthed(true);
          }
        } else if ((res?.msg ?? "").toLowerCase().includes("deactivat")) {
          // Account (or its batch) is deactivated — keep the session and show
          // the "Deactivated Student" screen instead of logging out.
          setAuthed(true);
          setDeactivated(true);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        if (isDeactivatedError(error)) {
          setAuthed(true);
          setDeactivated(true);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthed(false);
    setDeactivated(false);
    setPage("dashboard");
    setViewer(null);
  };

  const scrollTop = () => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const navigate = (key: PageKey) => {
    setViewer(null);
    setPage(key);
    scrollTop();
  };

  const openMaterial = (m: Material) => {
    setViewer({ type: m.type === "PDF" ? "pdf" : "video", material: m });
    setPage("materials");
    scrollTop();
  };

  const closeViewer = () => {
    setViewer(null);
    scrollTop();
  };

  const contentKey = deactivated
    ? "deactivated"
    : viewer
      ? `viewer-${viewer.type}-${viewer.material.material_id}`
      : page;

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {authed ? (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AppShell
              active={page}
              contentKey={contentKey}
              onNavigate={navigate}
              onLogout={logout}
            >
              {deactivated ? (
                <DeactivatedView onLogout={logout} />
              ) : viewer ? (
                viewer.type === "pdf" ? (
                  <PdfViewerPage material={viewer.material} onBack={closeViewer} />
                ) : (
                  <VideoPlayerPage
                    material={viewer.material}
                    onBack={closeViewer}
                    onOpenMaterial={openMaterial}
                  />
                )
              ) : (
                <>
                  {page === "dashboard" && (
                    <DashboardPage onNavigate={navigate} onOpen={openMaterial} />
                  )}
                  {page === "materials" && <MaterialsPage onOpen={openMaterial} />}
                  {page === "performance" && <PerformancePage />}
                  {page === "profile" && (
                    <ProfilePage onLogout={logout} />
                  )}
                </>
              )}
            </AppShell>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LoginPage onLogin={() => setAuthed(true)} />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster position="top-center" richColors />
    </>
  );
}
