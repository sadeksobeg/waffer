import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface WithAuthProps {
  requiredRole?: string | string[];
}

/**
 * Higher-order component that protects routes requiring authentication
 * @param WrappedComponent The component to wrap with authentication
 * @param options Options for authentication (e.g., required role)
 */
const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthProps = {}
) => {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { currentUser, loading, userRole } = useAuth();
    const router = useRouter();
    const { requiredRole } = options;

    useEffect(() => {
      // If authentication check is complete and user is not logged in, redirect to login
      if (!loading && !currentUser) {
        router.push({
          pathname: '/login',
          query: { returnUrl: router.asPath },
        });
      }
      
      // If role check is required and user doesn't have the required role
      if (
        !loading && 
        currentUser && 
        requiredRole && 
        userRole &&
        !hasRequiredRole(userRole, requiredRole)
      ) {
        router.push('/unauthorized');
      }
    }, [currentUser, loading, router, userRole, requiredRole]);

    // Check if user has the required role
    const hasRequiredRole = (userRole: string, requiredRole: string | string[]): boolean => {
      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
      }
      return userRole === requiredRole;
    };

    // Show loading state while checking authentication
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        </Box>
      );
    }

    // If not authenticated, show nothing (will redirect)
    if (!currentUser) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Redirecting to login...
          </Typography>
        </Box>
      );
    }

    // If role is required but user doesn't have it, show nothing (will redirect)
    if (
      requiredRole && 
      userRole && 
      !hasRequiredRole(userRole, requiredRole)
    ) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Checking permissions...
          </Typography>
        </Box>
      );
    }

    // If authenticated and has required role, render the component
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAuthComponent.displayName = `withAuth(${displayName})`;

  return WithAuthComponent;
};

export default withAuth;
