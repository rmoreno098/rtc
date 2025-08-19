import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/signin/SignIn";
import SignUp from "./components/signup/Signup";
import Home from "./components/home/Home";

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
