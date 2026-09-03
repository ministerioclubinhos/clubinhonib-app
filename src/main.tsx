import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/store/slices";
import { FeatureFlagsProvider } from "@/features/feature-flags";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      {/*
        As feature flags são carregadas uma vez e compartilhadas: o provedor
        fica acima do App, que já as consulta para montar as rotas.
      */}
      <FeatureFlagsProvider>
        <App />
      </FeatureFlagsProvider>
    </Provider>
  </React.StrictMode>
);
