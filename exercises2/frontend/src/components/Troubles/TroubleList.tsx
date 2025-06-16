'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

interface Trouble {
  item_id: string;
  category: string;
  message: string;
}

interface ApiResponse {
  items: Trouble[];
  nextToken: string | null;
}

const TroubleList: React.FC = () => {
  const [troubles, setTroubles] = useState<Trouble[]>([]);
  const [open, setOpen] = useState(false);
  const [newTrouble, setNewTrouble] = useState<Partial<Trouble>>({
    category: '',
    message: '',
  });

  const api = useMemo(() => axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  }), []);

  const fetchTroubles = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse>('/troubles');
      if (response.data && Array.isArray(response.data.items)) {
        setTroubles(response.data.items);
      } else {
        console.error('Invalid response format:', response.data);
        setTroubles([]);
      }
    } catch (error) {
      console.error('Error fetching troubles:', error);
      setTroubles([]);
    }
  }, [api]);

  useEffect(() => {
    fetchTroubles();
  }, [fetchTroubles]);

  const handleCreateTrouble = async () => {
    try {
      await api.post('/troubles', newTrouble);
      setOpen(false);
      setNewTrouble({ category: '', message: '' });
      fetchTroubles();
    } catch (error) {
      console.error('Error creating trouble:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Troubles</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Create Trouble
        </Button>
      </Box>

      <List>
        {troubles && troubles.length > 0 ? (
          troubles.map((trouble) => (
            <Card key={trouble.item_id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">ID: {trouble.item_id}</Typography>
                {trouble.category && (
                  <Typography color="textSecondary">
                    Category: {trouble.category}
                  </Typography>
                )}
                {trouble.message && (
                  <Typography color="textSecondary">
                    Message: {trouble.message}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary" align="center">
            No troubles found
          </Typography>
        )}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Trouble</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category"
            fullWidth
            value={newTrouble.category}
            onChange={(e) => setNewTrouble({ ...newTrouble, category: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={newTrouble.message}
            onChange={(e) => setNewTrouble({ ...newTrouble, message: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTrouble} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TroubleList; 