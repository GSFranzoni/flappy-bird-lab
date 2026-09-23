import { useState } from "react";

import { Play } from "@/components/game/play";
import { Training } from "@/components/game/training";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type View = "training" | "play";

export function App() {
  const [view, setView] = useState<View>("training");

  return (
    <main className="min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Flappy Bird Lab</h1>
            <p className="text-muted-foreground mt-1 text-sm">Neuroevolution playground</p>
          </div>
          <Tabs value={view} onValueChange={(value) => setView(value as View)}>
            <TabsList aria-label="Flappy Lab views">
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="play">Play</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      {view === "training" ? <Training /> : <Play />}
    </main>
  );
}
