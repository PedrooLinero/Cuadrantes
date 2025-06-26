import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Card, CardContent, Grid, Checkbox, FormControlLabel } from '@mui/material';
import { apiUrl } from '../config';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ResponsiveAppBar from './Menu';

function CreateCenterScreen() {
  const [restricciones, setRestricciones] = useState([]);
  const [centros, setCentros] = useState([]);
  const [nombreCentro, setNombreCentro] = useState('');
  const [restriccionesSeleccionadas, setRestriccionesSeleccionadas] = useState([]);
  const [centroSeleccionado, setCentroSeleccionado] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${apiUrl}/restricciones`)
      .then(res => res.json())
      .then(data => {
        if (data.success || data.ok) {
          setRestricciones(data.data || data.datos);
        }
      })
      .catch(error => console.error('Error al cargar restricciones:', error));

    fetch(`${apiUrl}/centros`)
      .then(res => res.json())
      .then(data => {
        if (data.success || data.ok) {
          setCentros(data.data || data.datos);
        }
      })
      .catch(error => console.error('Error al cargar centros:', error));
  }, []);

  const handleSaveCentro = async () => {
    if (!nombreCentro.trim()) {
      alert('Por favor, ingresa un nombre para el centro.');
      return;
    }

    if (restriccionesSeleccionadas.length === 0) {
      alert('Por favor, selecciona al menos una restricción.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/centros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_centro: nombreCentro, id_restriccion: restriccionesSeleccionadas }),
      });

      const data = await response.json();
      if (data.success || data.ok) {
        alert(data.mensaje || 'Centro creado con éxito');
        setNombreCentro('');
        setRestriccionesSeleccionadas([]);
        const updatedCentros = await fetch(`${apiUrl}/centros`).then(res => res.json()).then(data => data.data || data.datos);
        setCentros(updatedCentros);
        const newCenterId = updatedCentros.find(c => c.nombre_centro === nombreCentro)?.id;
        if (newCenterId) {
          localStorage.setItem('lastSelectedCenterId', newCenterId);
          console.log('Nuevo centro creado y guardado:', { id: newCenterId, nombre_centro: nombreCentro }); // Depuración
        } else {
          console.error('No se pudo encontrar el ID del nuevo centro:', updatedCentros);
        }
        navigate('/generarcuadrante');
      } else {
        alert(data.mensaje || 'Error al crear el centro');
      }
    } catch (error) {
      console.error('Error al guardar el centro:', error);
      alert('Ocurrió un error al intentar guardar el centro.');
    }
  };

  const handleSelectCentro = () => {
    if (centroSeleccionado) {
      const selectedCenter = centros.find(c => String(c.id) === String(centroSeleccionado));
      if (selectedCenter) {
        localStorage.setItem('lastSelectedCenterId', centroSeleccionado);
        console.log('Centro seleccionado y guardado:', selectedCenter); // Depuración
      } else {
        console.error('Centro no encontrado con ID:', centroSeleccionado);
      }
      navigate('/generarcuadrante');
    } else {
      console.warn('No se seleccionó ningún centro');
    }
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setRestriccionesSeleccionadas([...restriccionesSeleccionadas, Number(value)]);
    } else {
      setRestriccionesSeleccionadas(restriccionesSeleccionadas.filter(id => id !== Number(value)));
    }
  };

  return (
    <>
      <ResponsiveAppBar />
      <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 6, p: 3, background: '#f5f7fa', borderRadius: 4, boxShadow: 3 }}>
        <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 4 }}>
          Gestión de Centros
        </Typography>
        <Grid container spacing={5} direction="column">
          <Grid item xs={12}>
            <Card sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: 4, background: '#fff' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                  Crear Nuevo Centro
                </Typography>
                <TextField
                  label="Nombre del Centro"
                  fullWidth
                  value={nombreCentro}
                  onChange={e => setNombreCentro(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <InputLabel id="restriccion-label" sx={{ mb: 1 }}>Restricciones</InputLabel>
                  {restricciones.map((restriccion) => (
                    <FormControlLabel
                      key={restriccion.id}
                      control={
                        <Checkbox
                          value={restriccion.id}
                          checked={restriccionesSeleccionadas.includes(restriccion.id)}
                          onChange={handleCheckboxChange}
                          color="primary"
                        />
                      }
                      label={restriccion.descripcion}
                    />
                  ))}
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSaveCentro}
                  sx={{ mt: 2, fontWeight: 'bold', fontSize: 18, py: 1.5, borderRadius: 2, boxShadow: 2 }}
                >
                  Crear Centro
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: 4, background: '#fff' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                  Seleccionar Centro Existente
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
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
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={!centroSeleccionado}
                  onClick={handleSelectCentro}
                  sx={{ mt: 2, fontWeight: 'bold', fontSize: 18, py: 1.5, borderRadius: 2, boxShadow: 2 }}
                >
                  Seleccionar Centro
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default CreateCenterScreen;