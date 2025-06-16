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

interface Role {
  role_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  roles: Role[];
}

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [open, setOpen] = useState(false);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    description: '',
  });

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse>('/roles');
      setRoles(response.data.roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreateRole = async () => {
    try {
      await api.post('/roles', newRole);
      setOpen(false);
      setNewRole({ name: '', description: '' });
      fetchRoles();
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Roles</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Create Role
        </Button>
      </Box>

      <List>
        {roles.map((role) => (
          <Card key={role.role_id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{role.name}</Typography>
              <Typography color="textSecondary">{role.description}</Typography>
              <Typography variant="body2" color="textSecondary">
                Created: {new Date(role.created_at).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newRole.description}
            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRole} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleList; 