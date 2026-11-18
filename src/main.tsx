import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/store/slices";
import { FeatureFlagsProvider } from "@/features/feature-flags";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/queryClient";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {/*
          As feature flags e o cache de consultas são instâncias únicas da
          aplicação. Qualquer rota pode usar TanStack Query sem criar um
          provider local ou perder o cache ao navegar.
        */}
        <FeatureFlagsProvider>
          <App />
        </FeatureFlagsProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
