import { createFileRoute } from "@tanstack/react-router";

import { Training } from "@/components/game/training";

export const Route = createFileRoute("/training")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Training />;
}
