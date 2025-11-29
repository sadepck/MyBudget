import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(null);

  // Verificar si hay usuario logueado al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar autenticación
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Registrar usuario
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setIsError(null);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
        return { success: true };
      } else {
        setIsError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error registering:', error);
      setIsError('Error de conexión con el servidor');
      return { success: false, error: 'Error de conexión con el servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  // Login usuario
  const login = async (userData) => {
    try {
      setIsLoading(true);
      setIsError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
        return { success: true };
      } else {
        setIsError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setIsError('Error de conexión con el servidor');
      return { success: false, error: 'Error de conexión con el servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout usuario
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isError,
      register,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};
