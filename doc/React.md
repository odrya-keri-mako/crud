# React

#### Create aplication
```bash
cd frontend
npm create vite@latest react -- --template react
cd react
npm i
npm i react-router-dom axios
npm i bootstrap @fortawesome/fontawesome-free
```

#### Binding Bootstrap and Font Awesome (src/main.jsx)
```jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
```

#### Router framework (src/App.jsx)
```jsx
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
```