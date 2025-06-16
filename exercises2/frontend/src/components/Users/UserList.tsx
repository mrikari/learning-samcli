'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { getToken } from '@/utils/storage';

interface User {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  password?: string;
}

interface ApiResponse {
  users: User[];
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    email: '',
    password: '',
  });

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse>('/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async () => {
    try {
      await api.post('/users', newUser);
      setOpen(false);
      setNewUser({ username: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Users</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Create User
        </Button>
      </Box>

      <List>
        {users.map((user) => (
          <Card key={user.user_id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{user.username}</Typography>
              <Typography color="textSecondary">{user.email}</Typography>
              <Typography variant="body2" color="textSecondary">
                Created: {new Date(user.created_at).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList; 