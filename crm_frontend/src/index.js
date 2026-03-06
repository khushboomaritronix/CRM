import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store";
import AppRouter from "./routes/index";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#2D3748",
            color: "#fff",
            fontSize: "13.5px",
            borderRadius: "8px",
          },
          success: { iconTheme: { primary: "#48BB78", secondary: "#fff" } },
          error: { iconTheme: { primary: "#FC8181", secondary: "#fff" } },
        }}
      />
    </Provider>
  </React.StrictMode>
);
