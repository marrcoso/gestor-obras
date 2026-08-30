import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { AuthContainer } from '../components/auth/AuthContainer.js';
import { RegisterForm } from '../components/auth/RegisterForm.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redireciona se já autenticado
  useEffect(() => {
    if (user) {
      navigate(user.perfil === 'MESTRE_OBRA' ? '/campo' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <AuthContainer maxWidthClass="max-w-xl">
      <RegisterForm />
    </AuthContainer>
  );
};
