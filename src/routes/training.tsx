import { createFileRoute } from "@tanstack/react-router";

import { Game } from "@/components/game/training";

export const Route = createFileRoute("/training")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Game />;
}
