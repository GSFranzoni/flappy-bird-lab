import { createFileRoute } from "@tanstack/react-router";

import { Play } from "@/components/game/play";

export const Route = createFileRoute("/play")({
  component: Play,
});
