import pb from './pocketbase';
import React, { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface AuthMiddlewareProps {
  children: ReactNode;
}

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const isAuthenticated = pb.authStore.isValid;

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated. Redirecting to login page.');
    }
  }, [isAuthenticated]);

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace={true} />;
};

export default AuthMiddleware;
