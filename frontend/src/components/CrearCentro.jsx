import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { apiUrl } from '../config';

function CreateCenterScreen() {
  const [restricciones, setRestricciones] = useState([]);
  const [centros, setCentros] = useState([]);
  const [nombreCentro, setNombreCentro] = useState('');
  const [restriccionesSeleccionadas, setRestriccionesSeleccionadas] = useState([]);
  const [centroSeleccionado, setCentroSeleccionado] = useState('');

  useEffect(() => {
    // Obtener restricciones del backend
    fetch(`${apiUrl}/restricciones`)
      .then(res => res.json())
      .then(data => {
        if (data.success || data.ok) {
          setRestricciones(data.data || data.datos);
        }
      });

    // Obtener centros del backend
    fetch(`${apiUrl}/centros`)
      .then(res => res.json())
      .then(data => {
        if (data.success || data.ok) {
          setCentros(data.data || data.datos);
        }
      });
  }, []);

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Crear Centro
      </Typography>
      <TextField
        label="Nombre del Centro"
        fullWidth
        value={nombreCentro}
        onChange={e => setNombreCentro(e.target.value)}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="restriccion-label">Restricciones</InputLabel>
        <Select
          labelId="restriccion-label"
          multiple
          value={restriccionesSeleccionadas}
          label="Restricciones"
          onChange={e => setRestriccionesSeleccionadas(e.target.value)}
          renderValue={(selected) =>
            restricciones
              .filter(r => selected.includes(r.id))
              .map(r => r.descripcion)
              .join(', ')
          }
        >
          {restricciones.map((restriccion) => (
            <MenuItem key={restriccion.id} value={restriccion.id}>
              {restriccion.descripcion}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="centro-label">Centro existente</InputLabel>
        <Select
          labelId="centro-label"
          value={centroSeleccionado}
          label="Centro existente"
          onChange={e => setCentroSeleccionado(e.target.value)}
        >
          {centros.map((centro) => (
            <MenuItem key={centro.id} value={centro.id}>
              {centro.nombre_centro}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button sx={{ mb: 4 }} variant="contained" color="primary">
        Guardar Centro
      </Button>
    </Box>
  );
}

export default CreateCenterScreen;