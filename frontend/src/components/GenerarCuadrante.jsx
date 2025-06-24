import { Box, Button, Typography, Grid, Paper, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useState, useEffect } from "react";
import { apiUrl } from "../config";

function GenerarCuadrante() {
  const [archivoCuadrante, setArchivoCuadrante] = useState(null);
  const [centers, setCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState('');

  useEffect(() => {
    // Simulamos que los centros vienen del estado global o localStorage (en un caso real, vendrían de un estado global)
    const storedCenters = JSON.parse(localStorage.getItem('centers') || '[]');
    setCenters(storedCenters);
  }, []);

  const handleFileChange = (e) => {
    setArchivoCuadrante(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!archivoCuadrante || !selectedCenterId) {
      alert("Por favor, selecciona el fichero del cuadrante y un centro.");
      return;
    }

    const formData = new FormData();
    formData.append("cuadrante", archivoCuadrante);
    const selectedCenter = centers.find(c => c.id === parseInt(selectedCenterId));
    formData.append("centerConstraints", JSON.stringify(selectedCenter.constraints));

    try {
      const response = await fetch(apiUrl + "/cuadrante", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cuadrante_resultado.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el cuadrante:", error);
      alert("Error al generar el cuadrante.");
    }
  };

  return (
    <Box sx={{ height: "72vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper sx={{ padding: 6, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", borderRadius: 3, maxWidth: 800, width: "100%", backgroundColor: "#ffffff" }}>
        <Typography variant="h4" align="center" sx={{ marginBottom: 4, fontWeight: "bold", color: "#333" }}>
          Generar Cuadrante
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ "& > :not(style)": { m: 1, width: "100%" } }}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={10}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "700", color: "#555" }}>
                Selecciona el Centro:
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Centro</InputLabel>
                <Select
                  value={selectedCenterId}
                  onChange={(e) => setSelectedCenterId(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Selecciona un centro
                  </MenuItem>
                  {centers.map((center) => (
                    <MenuItem key={center.id} value={center.id}>
                      {center.centerName} - {center.constraints.join(', ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={10}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "700", color: "#555" }}>
                Archivo del Cuadrante:
              </Typography>
              <input
                type="file"
                onChange={handleFileChange}
                required
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#fafafa", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px", marginTop: "8px" }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                padding: "10px 30px",
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#1565c0", boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)" },
              }}
            >
              Generar y Descargar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default GenerarCuadrante;