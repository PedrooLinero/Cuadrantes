const path = require("path");
const fs = require("fs");
const XLSX = require("sheetjs-style");

class cuadranteController {
  static leerExcel(nombreFichero) {
    try {
      const filePath = path.join(__dirname, "../Uploads/", nombreFichero);
      const workbook = XLSX.readFile(filePath);
      const sheets = {};
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        sheets[sheetName] = XLSX.utils.sheet_to_json(sheet);
      }
      return sheets;
    } catch (error) {
      console.error("Error al leer el archivo Excel:", error);
      throw new Error("Error al leer el archivo Excel.");
    }
  }

  static async generarCuadrante(req, res) {
    try {
      const cuadranteFile = req.file ? req.file.filename : null;
      if (!cuadranteFile) {
        return res.status(400).json({ message: "Se debe subir un archivo de cuadrante." });
      }

      const excelData = cuadranteController.leerExcel(cuadranteFile);
      const trabajadores = excelData["Trabajadores"] || [];
      const restricciones = excelData["Restricciones"] || [];
      const turnos = excelData["Turnos"] || [];

      if (!trabajadores.length || !restricciones.length || !turnos.length) {
        return res.status(400).json({ message: "El archivo Excel no contiene las hojas o datos requeridas." });
      }

      // Obtener restricciones del centro desde el frontend
      const centerConstraints = req.body.centerConstraints ? JSON.parse(req.body.centerConstraints) : [];

      console.log("Trabajadores:", JSON.stringify(trabajadores, null, 2));
      console.log("Restricciones:", JSON.stringify(restricciones, null, 2));
      console.log("Turnos:", JSON.stringify(turnos, null, 2));
      console.log("Restricciones del Centro:", centerConstraints);

      const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      const cuadrante = [];
      const diasTrabajador = new Map();
      const horasPorDia = {};
      trabajadores.forEach(t => diasTrabajador.set(t.ID, []));

      const restriccionesMap = new Map();
      restricciones.forEach(r => {
        if (!restriccionesMap.has(r.ID_Trabajador)) {
          restriccionesMap.set(r.ID_Trabajador, []);
        }
        restriccionesMap.get(r.ID_Trabajador).push(r);
      });

      function puedeAsignar(trabajador, dia, turno) {
        console.log(`Verificando si ${trabajador.Nombre} puede trabajar el ${dia} en el turno ${turno}`);
        const disponibilidad = (trabajador[`Disponible_${dia}`] || "").trim().toLowerCase();
        if (disponibilidad !== "sí") {
          console.log(`${trabajador.Nombre} no está disponible el ${dia}`);
          return false;
        }

        const restriccionesTrab = restriccionesMap.get(trabajador.ID) || [];
        const maxDiasConsecutivos = restriccionesTrab.find(r => r.Restricción === "max_dias_consecutivos")?.Valor || 6;
        const diasAsignados = diasTrabajador.get(trabajador.ID);

        if (diasAsignados.length > 0) {
          const idxDia = dias.indexOf(dia);
          const idxUltimo = dias.indexOf(diasAsignados[diasAsignados.length - 1]);
          if (idxDia - idxUltimo === 1 && diasAsignados.length >= maxDiasConsecutivos) {
            console.log(`${trabajador.Nombre} excede días consecutivos`);
            return false;
          }
        }

        const key = trabajador.ID + "_" + dia;
        if (horasPorDia[key] && horasPorDia[key] >= 8) {
          console.log(`${trabajador.Nombre} excede 8 horas el ${dia}`);
          return false;
        }

        if (diasAsignados.length >= 6) {
          console.log(`${trabajador.Nombre} no puede trabajar 7 días`);
          return false;
        }

        for (const r of restriccionesTrab) {
          if (r.Restricción === "no_turno" && r.Valor === turno) {
            console.log(`${trabajador.Nombre} no puede trabajar el turno ${turno}`);
            return false;
          }
          if (r.Restricción === "dias_descanso" && r.Valor.split(",").map(d => d.trim().toLowerCase()).includes(dia.toLowerCase())) {
            console.log(`${trabajador.Nombre} debe descansar el ${dia}`);
            return false;
          }
        }

        // Aplicar restricciones del centro
        if (centerConstraints.includes('Mínimo 2 trabajadores por turno') && cuadrante.length > 0) {
          const prevDay = cuadrante[cuadrante.length - 1];
          if (!prevDay.Mañana || !prevDay.Tarde) {
            console.log(`Falta un segundo trabajador para ${dia} debido a la restricción del centro`);
            return false;
          }
        }
        if (centerConstraints.includes('Máximo 8 horas por día') && horasPorDia[key] && horasPorDia[key] >= 8) {
          console.log(`${trabajador.Nombre} excede 8 horas por día según restricción del centro`);
          return false;
        }

        return true;
      }

      for (const dia of dias) {
        const asignacionesDia = ["", ""];
        let intentosManana = 0;
        let intentosTarde = 0;

        // Asignar turno de mañana
        while (!asignacionesDia[0] && intentosManana < trabajadores.length) {
          for (const t of trabajadores) {
            if (puedeAsignar(t, dia, "mañana") && !asignacionesDia.includes(t.Nombre)) {
              asignacionesDia[0] = t.Nombre;
              diasTrabajador.get(t.ID).push(dia);
              horasPorDia[t.ID + "_" + dia] = (horasPorDia[t.ID + "_" + dia] || 0) + 6;
              console.log(`Asignado ${t.Nombre} a ${dia} mañana`);
              break;
            }
          }
          intentosManana++;
        }

        // Asignar turno de tarde (diferente trabajador)
        while (!asignacionesDia[1] && intentosTarde < trabajadores.length) {
          for (const t of trabajadores) {
            if (puedeAsignar(t, dia, "tarde") && t.Nombre !== asignacionesDia[0] && !asignacionesDia.includes(t.Nombre)) {
              asignacionesDia[1] = t.Nombre;
              diasTrabajador.get(t.ID).push(dia);
              horasPorDia[t.ID + "_" + dia] = (horasPorDia[t.ID + "_" + dia] || 0) + 6;
              console.log(`Asignado ${t.Nombre} a ${dia} tarde`);
              break;
            }
          }
          intentosTarde++;
        }

        cuadrante.push({ Día: dia, Mañana: asignacionesDia[0] || "Sin asignar", Tarde: asignacionesDia[1] || "Sin asignar" });
      }

      const cuadranteTabla = [];
      const cabecera = ["Turno/Hora"];
      dias.forEach(dia => cabecera.push(dia));
      cuadranteTabla.push(cabecera);

      const horaManana = turnos.find(t => t.Turno?.toLowerCase() === "mañana")?.Hora || "";
      const horaTarde = turnos.find(t => t.Turno?.toLowerCase() === "tarde")?.Hora || "";
      const filaManana = [`Mañana${horaManana ? " (" + horaManana + ")" : ""}`];
      const filaTarde = [`Tarde${horaTarde ? " (" + horaTarde + ")" : ""}`];
      cuadrante.forEach(asignacion => {
        filaManana.push(asignacion.Mañana);
        filaTarde.push(asignacion.Tarde);
      });
      cuadranteTabla.push(filaManana);
      cuadranteTabla.push(filaTarde);

      const worksheet = XLSX.utils.aoa_to_sheet(cuadranteTabla);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cuadrante");

      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cellAddress]) continue;
          worksheet[cellAddress].s = {
            alignment: { horizontal: "center", vertical: "center" },
            border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } },
          };
        }
      }

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
      res.setHeader("Content-Disposition", "attachment; filename=cuadrante_resultado.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(excelBuffer);
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      res.status(500).json({ message: "Error al generar el cuadrante." });
    }
  }
}

module.exports = cuadranteController;