'use client';
import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/utils/storage';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" component={Link} href="/">
            Troubles
          </Button>
          <Button color="inherit" component={Link} href="/users">
            Users
          </Button>
          <Button color="inherit" component={Link} href="/roles">
            Roles
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout; 