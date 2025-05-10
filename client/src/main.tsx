import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TelegramProvider } from "./lib/telegram";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TelegramProvider>
      <App />
    </TelegramProvider>
  </QueryClientProvider>
);
