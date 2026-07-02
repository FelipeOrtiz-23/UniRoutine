import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { ViewModeProvider } from "./context/ViewModeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ViewModeProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </ViewModeProvider>
    </ThemeProvider>
  </StrictMode>,
);
