import { createRootRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// oxlint-disable-next-line react/only-export-components
const RootLayout = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeTab = pathname === "/play" ? "play" : "training";

  return (
    <main className="min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Flappy Lab</h1>
            <p className="text-muted-foreground mt-1 text-sm">Neuroevolution playground</p>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (value === "training" || value === "play") {
                void navigate({ to: value === "training" ? "/training" : "/play" });
              }
            }}
          >
            <TabsList aria-label="Flappy Lab views">
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="play">Play</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </main>
  );
};

export const Route = createRootRoute({ component: RootLayout });
