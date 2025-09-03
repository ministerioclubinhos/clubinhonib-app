import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
// ajuste o caminho conforme seu projeto
import { store /*, persistor*/ } from "@/store/slices"; 
// import { PersistGate } from "redux-persist/integration/react";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      {/*
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
      */}
      <App />
    </Provider>
  </React.StrictMode>
);
