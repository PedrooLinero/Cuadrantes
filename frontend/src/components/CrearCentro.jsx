import React, { useState } from 'react';
import { Box, Button, Typography, Grid, Paper, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText, TextField } from '@mui/material';
import * as XLSX from 'xlsx';

function CreateCenterScreen() {
  const [formData, setFormData] = useState({
    centerName: '',
    constraints: [],
  });
  const [centers, setCenters] = useState([]);
  const [workersFile, setWorkersFile] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [schedule, setSchedule] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConstraintChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({ ...prev, constraints: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleSubmitCenter = (e) => {
    e.preventDefault();
    if (!formData.centerName || formData.constraints.length === 0) {
      alert('Por favor, completa el nombre del centro y selecciona al menos una restricción.');
      return;
    }
    setCenters(prev => [...prev, { ...formData, id: Date.now(), workers: workers }]);
    setFormData({ centerName: '', constraints: [] }); // Resetear formulario
    setWorkers([]); // Resetear trabajadores
    setWorkersFile(null);
  };

  const handleWorkersFileChange = (e) => {
    setWorkersFile(e.target.files[0]);
  };

  const handleUploadWorkers = () => {
    if (!workersFile) {
      alert('Por favor, selecciona un archivo Excel.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setWorkers(jsonData.map(worker => ({
        ...worker,
        constraints: worker.constraints ? worker.constraints.split(',') : [],
      })));
    };
    reader.readAsArrayBuffer(workersFile);
  };

  const generateSchedule = () => {
    if (centers.length === 0 || !centers[centers.length - 1].workers.length) {
      alert('Debes crear un centro y añadir trabajadores primero.');
      return;
    }

    const currentCenter = centers[centers.length - 1];
    const combinedConstraints = {
      center: currentCenter.constraints.reduce((acc, constraint) => {
        acc[constraint] = true;
        return acc;
      }, {}),
      workers: currentCenter.workers.map(w => w.constraints.reduce((acc, c) => {
        acc[c] = true;
        return acc;
      }, {})),
    };

    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const shifts = ['Mañana', 'Tarde'];
    const scheduleData = [];

    dias.forEach(day => {
      const daySchedule = { day };
      shifts.forEach(shift => {
        const availableWorkers = currentCenter.workers.filter(worker => {
          const workerConstraints = worker.constraints || [];
          return (worker[`Disponible_${day}`] || '').toLowerCase() === 'sí' &&
                 !workerConstraints.some(c => c.includes(day.toLowerCase()) && c.includes('descansa')) &&
                 (!combinedConstraints.center['Mínimo 2 trabajadores por turno'] || scheduleData.length < 1 || Math.random() > 0.5);
        });
        daySchedule[shift] = availableWorkers.length > 0 ? availableWorkers[Math.floor(Math.random() * availableWorkers.length)].name : 'Sin asignar';
      });
      scheduleData.push(daySchedule);
    });

    setSchedule(scheduleData);
  };

  return (
    <Box sx={{ height: '72vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
      <Paper sx={{ padding: 6, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', borderRadius: 3, maxWidth: 800, width: '100%', backgroundColor: '#ffffff' }}>
        <Typography variant="h4" align="center" sx={{ marginBottom: 4, fontWeight: 'bold', color: '#333' }}>
          Crear Centro de Trabajo
        </Typography>
        <Box component="form" onSubmit={handleSubmitCenter} sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={10}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '700', color: '#555' }}>
                Nombre del Centro:
              </Typography>
              <TextField
                name="centerName"
                value={formData.centerName}
                onChange={handleInputChange}
                placeholder="Ej. COVAP"
                variant="outlined"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={10}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '700', color: '#555' }}>
                Restricciones del Centro:
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Restricciones</InputLabel>
                <Select
                  multiple
                  value={formData.constraints}
                  onChange={handleConstraintChange}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                      },
                    },
                  }}
                >
                  {['Mínimo 2 trabajadores por turno', 'Máximo 10 horas extras por semana', 'Máximo 8 horas por día'].map((constraint) => (
                    <MenuItem key={constraint} value={constraint}>
                      <Checkbox checked={formData.constraints.indexOf(constraint) > -1} />
                      <ListItemText primary={constraint} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                padding: '10px 30px',
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#1565c0', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' },
              }}
            >
              Crear Centro
            </Button>
          </Box>
        </Box>

        {centers.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Centros Creados:
            </Typography>
            <ul>
              {centers.map((center) => (
                <li key={center.id}>
                  {center.centerName} - Restricciones: {center.constraints.join(', ')} - Trabajadores: {center.workers.length}
                </li>
              ))}
            </ul>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: '700', color: '#555', mb: 2 }}>
            Añadir Trabajadores (Excel)
          </Typography>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleWorkersFileChange}
            style={{ marginBottom: '16px' }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUploadWorkers}
            sx={{ mr: 2 }}
          >
            Subir Trabajadores
          </Button>
          {workers.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: '700', color: '#555' }}>
                Trabajadores Añadidos:
              </Typography>
              <ul>
                {workers.map((worker, index) => (
                  <li key={index}>
                    {worker.name} - Restricciones: {worker.constraints.join(', ')}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={generateSchedule}
            sx={{
              padding: '10px 30px',
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#1565c0', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' },
            }}
          >
            Generar Horario
          </Button>
          {schedule && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                Horario Generado:
              </Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Día</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Mañana</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tarde</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((day, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{day.day}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{day.Mañana}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{day.Tarde}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateCenterScreen;