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

#### Binding Bootstrap and Font Awesome (frontend/react/src/main.jsx)
Add lines to src/main.jsx
```jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
```

#### Router framework (frontend/react/src/App.jsx)
Replace src/App.jsx
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

#### Create API (frontend/react/src/api.js)
```bash
cd src
touch api.js
```

#### Replace (frontend/react/src/api.js)
```js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001/api",
  timeout: 10000,
});
```

#### Create page (frontend/react/src/pages/InsectsPage.jsx)
```bash
cd ..
mkdir pages
cd pages
touch InsectsPage.jsx
```

#### Replace (frontend/react/src/pages/InsectsPage.jsx)
```jsx

```

