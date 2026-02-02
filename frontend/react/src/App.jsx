import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import InsectsPage from "./pages/InsectsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/insects" element={<InsectsPage />} />
        <Route path="*" element={<Navigate to="/insects" replace />} />
      </Routes>
    </BrowserRouter>
  );
}