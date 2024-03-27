import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Users from "./pages/Users";
import { GlobalStateProvider } from "./GlobalStateProvider";

const App = () => {
  return (
    <GlobalStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/users" element={<Users />} />
        </Routes>
      </BrowserRouter>
    </GlobalStateProvider>
  );
};

export default App;
