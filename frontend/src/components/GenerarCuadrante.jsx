import { Box, Button, Typography, Grid, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { apiUrl } from "../config";
import ResponsiveAppBar from "./Menu";

function GenerarCuadrante() {
  const [archivoCuadrante, setArchivoCuadrante] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await fetch(`${apiUrl}/centros`);
        const data = await response.json();
        if (data.success || data.ok) {
          const centersData = data.data || data.datos;
          setCenters(centersData);
          const lastSelectedId = localStorage.getItem("lastSelectedCenterId");
          console.log(
            "lastSelectedCenterId from localStorage:",
            lastSelectedId
          );
          if (lastSelectedId) {
            const found = centersData.find(
              (c) => String(c.id) === String(lastSelectedId)
            );
            if (found) {
              setSelectedCenter(found);
              console.log("Centro encontrado:", found);
            } else {
              console.warn(
                "Centro con ID",
                lastSelectedId,
                "no encontrado en:",
                centersData
              );
              setSelectedCenter(null);
            }
          }
        } else {
          console.error("Respuesta del backend fallida:", data);
          setSelectedCenter(null);
        }
      } catch (error) {
        console.error("Error al cargar centros:", error);
        setSelectedCenter(null);
      }
    };
    fetchCenters();
  }, []);

  const handleFileChange = (e) => {
    setArchivoCuadrante(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!archivoCuadrante || !selectedCenter) {
      alert(
        "Por favor, selecciona el fichero del cuadrante y asegúrate de que un centro esté seleccionado."
      );
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("cuadrante", archivoCuadrante);
    const constraints =
      selectedCenter.restricciones?.map((r) => r.descripcion) || [];
    if (constraints.length === 0) {
      console.warn(
        "No se encontraron restricciones para el centro seleccionado, usando valor por defecto."
      );
      constraints.push(
        "Mínimo 1 trabajador por turno",
        "Máximo 8 horas por día"
      ); // Valor por defecto
    }
    formData.append("centerConstraints", JSON.stringify(constraints));
    formData.append("centerId", selectedCenter.id);
    formData.append("centerName", selectedCenter.nombre_centro);

    try {
      const response = await fetch(`${apiUrl}/cuadrante/leer-restricciones`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error en la respuesta del servidor"
        );
      }

      // Mostrar los datos recibidos en la consola del navegador
      const data = await response.json();
      console.log("Trabajadores desde Excel:", data.trabajadores);
      console.log("Restricciones del centro:", data.restriccionesCentro);
      console.log("Diccionario de restricciones:", data.diccionario);
      alert("Datos recibidos correctamente. Revisa la consola del navegador.");
      // No descargar nada ni generar cuadrante
    } catch (error) {
      console.error("Error al generar el cuadrante:", error);
      setError(error.message || "Error al generar el cuadrante.");
      alert(error.message || "Error al generar el cuadrante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ResponsiveAppBar />
      <Box
        sx={{
          height: "72vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {selectedCenter ? (
          <Paper
            sx={{
              mt: 3,
              mb: 2,
              px: 4,
              py: 2,
              background: "#e3f2fd",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#1976d2", fontWeight: "bold" }}
            >
              Centro seleccionado: {selectedCenter.nombre_centro}
            </Typography>
            <Typography variant="body2" sx={{ color: "#333" }}>
              Restricciones:{" "}
              {Array.isArray(selectedCenter?.restricciones) &&
              selectedCenter.restricciones.length > 0
                ? selectedCenter.restricciones
                    .map((r) => r.descripcion)
                    .join(", ")
                : "Ninguna"}
            </Typography>
          </Paper>
        ) : (
          <Typography
            variant="h6"
            sx={{ mt: 3, color: "#d32f2f", fontWeight: "bold" }}
          >
            No hay un centro seleccionado. Por favor, crea o selecciona uno en
            la pantalla de gestión de centros.
          </Typography>
        )}
        <Paper
          sx={{
            padding: 6,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: 3,
            maxWidth: 800,
            width: "100%",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{ marginBottom: 4, fontWeight: "bold", color: "#333" }}
          >
            Generar Cuadrante
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ "& > :not(style)": { m: 1, width: "100%" } }}
          >
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={10}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: "700", color: "#555" }}
                >
                  Archivo del Cuadrante:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                  Formato requerido: Hojas "Restricciones" (ID_SAP, Nombre,
                  Centro, y restricciones como LV_7PERS, SD_6PERS, etc.) y
                  "Diccionario_Restricciones" (Código, Descripción). Pueden
                  añadirse más restricciones dinámicamente.
                </Typography>
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept=".xlsx, .xls, .csv"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    backgroundColor: "#fafafa",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                    marginTop: "8px",
                  }}
                />
              </Grid>
            </Grid>
            <Box
              sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}
            >
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={!selectedCenter || !archivoCuadrante || loading}
                sx={{
                  padding: "10px 30px",
                  borderRadius: 2,
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  textTransform: "none",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                {loading ? "Procesando..." : "Generar y Descargar Cuadrante"}
              </Button>
            </Box>
            {error && (
              <Typography
                variant="body2"
                sx={{ mt: 2, color: "#d32f2f", textAlign: "center" }}
              >
                Error: {error}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
}

export default GenerarCuadrante;
