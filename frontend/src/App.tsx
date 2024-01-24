import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AuthMiddleware from './authMiddleware';

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/signup" element={<Signup/>}/> 
          <Route path="/dashboard" element={
            <AuthMiddleware>
              <Dashboard/>
            </AuthMiddleware>
            }
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
