// src/routes/Navigation.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { map } from "lodash";
import routes from "./routes";

export function Navigation() {
  return (
    <Router>
      <Routes>
        {/* Redirige la raíz al panel */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* Resto de rutas declaradas en routes.js */}
        {map(routes, (route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <route.layout>
                <route.component />
              </route.layout>
            }
          />
        ))}
      </Routes>
    </Router>
  );
}
