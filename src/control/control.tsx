import { createRoot } from "react-dom/client";
import { ControlApp } from "./ControlApp";

function start() {
  const root = createRoot(document.getElementById("root")!);
  root.render(<ControlApp />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
