import { createRoot } from "react-dom/client";
import { DisplayApp } from "./DisplayApp";

function start() {
  const root = createRoot(document.getElementById("root")!);
  root.render(<DisplayApp />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
