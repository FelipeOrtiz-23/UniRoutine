package co.ucentral.BackEnd_UniRoutine.controlador;

import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Tarea;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Usuario;
import co.ucentral.BackEnd_UniRoutine.servicios.TareaServicio;
import co.ucentral.BackEnd_UniRoutine.servicios.UsuarioServicio;
import lombok.AllArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/tareas")
public class TareaControlador {
    @Autowired
    TareaServicio tareaServicio;
    @Autowired
    UsuarioServicio usuarioServicio;

    // End point para obtener todas las tareas por usuario
    @GetMapping("/usuario/{idUsuario}")
    public List<Tarea> obtenerTareasPorUsuario(@PathVariable int idUsuario) {
        Usuario usuario = usuarioServicio.consultarUsuarioPorId(idUsuario);
        usuario.setId_usuario(idUsuario);
        return tareaServicio.obtenerTareasPorUsuarioOrdenadasPorPrioridad(usuario);
    }
    // End point para crear una tarea
    @PostMapping("/crear")
    public ResponseEntity<String> crearTarea(@RequestBody Tarea tarea) {

        Tarea registro = tareaServicio.consultarTareaPorId(tarea.getId_tarea());
        if (registro != null) {
            tarea.setFechaCreacion(LocalDateTime.now());
            BeanUtils.copyProperties(tarea, registro);
            tareaServicio.guardarTarea(registro);
            return ResponseEntity.ok("Tarea actualizado con éxito: " + tarea.getId_tarea());
        }else {
            tarea.setId_tarea(usuarioServicio.generarId());
            tareaServicio.guardarTarea(tarea);
            return ResponseEntity.ok("Tarea creada con éxito: " + tarea.getId_tarea());
        }
    }

    // End point para eliminar una tarea
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarTarea(@PathVariable int id) {
        tareaServicio.eliminarTarea(id);
        return ResponseEntity.noContent().build();
    }
}
