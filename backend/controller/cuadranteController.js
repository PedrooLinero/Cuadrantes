const path = require("path");
const fs = require("fs");
const XLSX = require("sheetjs-style");

class CuadranteController {
  static leerExcel(nombreFichero) {
    const filePath = path.join(__dirname, "../Uploads/", nombreFichero);
    if (!fs.existsSync(filePath)) throw new Error("Archivo no encontrado.");
    const workbook = XLSX.readFile(filePath);
    const sheets = {};
    workbook.SheetNames.forEach((name) => {
      sheets[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
        header: 1,
      });
    });
    return sheets;
  }

  static async leerRestricciones(req, res) {
    try {
      const file = req.file?.filename;
      if (!file) return res.status(400).json({ message: "Falta archivo." });
      const excel = CuadranteController.leerExcel(file);

      const centerName = req.body.centerName;
      const [hdrRestricciones, ...rowsRestricciones] =
        excel["Restricciones"] || [];
      const centrosExcel = [
        ...new Set(
          rowsRestricciones.map((r) => r[hdrRestricciones.indexOf("Centro")])
        ),
      ];

      if (!centrosExcel.includes(centerName)) {
        return res.status(400).json({
          message: `El centro "${centerName}" no coincide con los centros en el Excel: ${centrosExcel.join(", ")}.`,
        });
      }

      // Diccionario de restricciones (opcional)
      const [hdrDiccionario, ...rowsDiccionario] =
        excel["Diccionario_Restricciones"] || [];
      const diccionario = Object.fromEntries(
        rowsDiccionario.map((r) => [r[0], r[1]])
      );

      // Parsear trabajadores y restricciones (solo válidos)
      const trabajadores = rowsRestricciones
        .map((r) => {
          const obj = {};
          hdrRestricciones.forEach((h, i) => (obj[h] = r[i]));
          obj.restricciones = {};
          hdrRestricciones.forEach((h, i) => {
            if (h !== "ID_SAP" && h !== "Nombre" && h !== "Centro") {
              obj.restricciones[h] = r[i] === "Sí" ? "Sí" : "No";
            }
          });
          obj.disponible = new Array(7).fill(true);
          return obj;
        })
        .filter((t) => t.Nombre && t.ID_SAP); // Solo trabajadores válidos

      // Leer restricciones del centro
      let restriccionesCentro = [];
      if (req.body.centerConstraints) {
        try {
          restriccionesCentro = JSON.parse(req.body.centerConstraints);
          if (!Array.isArray(restriccionesCentro)) {
            throw new Error(
              "Las restricciones del centro no son un array válido."
            );
          }
        } catch (e) {
          return res
            .status(400)
            .json({ message: "Formato inválido de restricciones del centro." });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Faltan las restricciones del centro." });
      }

      // Devolver solo la información leída
      console.log("Trabajadores desde Excel:", trabajadores);
      console.log("Restricciones del centro:", restriccionesCentro);
      console.log("Diccionario de restricciones:", diccionario);

      // Mostrar cuadrante generado en consola
      const cuadrante = CuadranteController.generarCuadranteSemanal(trabajadores, restriccionesCentro);
      console.log("Cuadrante generado:", JSON.stringify(cuadrante, null, 2));

      return res.json({
        trabajadores,
        restriccionesCentro,
        diccionario
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error al leer restricciones",
        error: error.message,
      });
    }
  }

  // Generar cuadrante semanal mejorado
  static generarCuadranteSemanal(trabajadores, restriccionesCentro) {
    const dias = [
      "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
    ];
    const turnos = ["Mañana", "Tarde", "Noche"];
    const cuadrante = {};
    // Control de asignaciones por trabajador (para NO_EXTRA y horas)
    const asignacionesPorTrabajador = {};
    trabajadores.forEach(t => asignacionesPorTrabajador[t.Nombre] = Array(dias.length).fill(null));

    // Procesar restricciones del centro
    let maxHorasPorDia = 8;
    let maxHorasExtraSemana = 0;
    restriccionesCentro.forEach(r => {
      if (/máximo\s*(\d+)\s*horas por día/i.test(r)) {
        maxHorasPorDia = parseInt(r.match(/máximo\s*(\d+)\s*horas por día/i)[1]);
      }
      if (/máximo\s*(\d+)\s*horas extras?/i.test(r)) {
        maxHorasExtraSemana = parseInt(r.match(/máximo\s*(\d+)\s*horas extras?/i)[1]);
      }
    });

    // Detectar si hay restricción de descanso en domingo
    const descansoDomingo = restriccionesCentro.some(r => /descanso.*domingo/i.test(r));

    // Detectar si hay restricción de mínimo 2 trabajadores por turno
    let minTrabajadoresPorTurno = 1;
    const matchMinTrab = restriccionesCentro.find(r => /mínimo\s*(\d+)\s*trabajadores? por turno/i.test(r));
    if (matchMinTrab) {
      minTrabajadoresPorTurno = parseInt(matchMinTrab.match(/mínimo\s*(\d+)\s*trabajadores? por turno/i)[1]);
    }

    // Control de horas semanales para MAX40H
    const horasSemanalesPorTrabajador = {};
    trabajadores.forEach(t => {
      horasSemanalesPorTrabajador[t.Nombre] = 0;
    });

    dias.forEach((dia, dIdx) => {
      cuadrante[dia] = {};
      // Si es domingo y hay restricción, dejar todos los turnos vacíos
      if (descansoDomingo && dia === "Domingo") {
        turnos.forEach(turno => {
          cuadrante[dia][turno] = [];
        });
        return; // Saltar a siguiente día
      }
      turnos.forEach((turno) => {
        // Filtrar trabajadores disponibles y compatibles
        let disponibles = trabajadores.filter((t) => {
          // SOLO_TURNO
          if (t.restricciones["SOLO_MAÑANA"] === "Sí" && turno !== "Mañana") return false;
          if (t.restricciones["SOLO_TARDE"] === "Sí" && turno !== "Tarde") return false;
          if (t.restricciones["SOLO_NOCHE"] === "Sí" && turno !== "Noche") return false;
          // NO_SAB_DOM
          if (t.restricciones["NO_SAB_DOM"] === "Sí" && (dia === "Sábado" || dia === "Domingo")) return false;
          // NO_EXTRA: solo un turno por día
          if (t.restricciones["NO_EXTRA"] === "Sí" && asignacionesPorTrabajador[t.Nombre][dIdx] !== null) return false;
          // MAX40H: no superar 40h semanales (5 turnos)
          if (t.restricciones["MAX40H"] === "Sí" && horasSemanalesPorTrabajador[t.Nombre] >= 40) return false;
          // Disponibilidad
          if (Array.isArray(t.disponible) && t.disponible[dIdx] === false) return false;
          // Control de horas diarias (asumimos 8h por turno)
          let horasHoy = 0;
          for (let tIdx = 0; tIdx < turnos.length; tIdx++) {
            if (asignacionesPorTrabajador[t.Nombre][dIdx] === turnos[tIdx]) horasHoy += 8;
          }
          if (horasHoy + 8 > maxHorasPorDia) return false;
          return true;
        });
        // Asignar el mínimo de trabajadores por turno si la restricción lo indica
        if (disponibles.length >= minTrabajadoresPorTurno) {
          // Ordenar por los que menos turnos llevan en la semana
          disponibles.sort((a, b) => {
            const aCount = asignacionesPorTrabajador[a.Nombre].filter(x => x !== null).length;
            const bCount = asignacionesPorTrabajador[b.Nombre].filter(x => x !== null).length;
            return aCount - bCount;
          });
          // Seleccionar los N primeros según el mínimo requerido
          const elegidos = disponibles.slice(0, minTrabajadoresPorTurno);
          cuadrante[dia][turno] = elegidos.map(e => e.Nombre);
          elegidos.forEach(elegido => {
            asignacionesPorTrabajador[elegido.Nombre][dIdx] = turno;
            if (elegido.restricciones["MAX40H"] === "Sí") {
              horasSemanalesPorTrabajador[elegido.Nombre] += 8;
            }
          });
        } else if (disponibles.length > 0) {
          // Si no hay suficientes, asignar los que haya
          cuadrante[dia][turno] = disponibles.map(e => e.Nombre);
          disponibles.forEach(elegido => {
            asignacionesPorTrabajador[elegido.Nombre][dIdx] = turno;
            if (elegido.restricciones["MAX40H"] === "Sí") {
              horasSemanalesPorTrabajador[elegido.Nombre] += 8;
            }
          });
        } else {
          cuadrante[dia][turno] = [];
        }
      });
    });
    // (Opcional) Aquí puedes añadir control de horas extra semanales
    return cuadrante;
  }
}

// Exportar la clase completa para usar métodos estáticos en las rutas
module.exports = CuadranteController;
