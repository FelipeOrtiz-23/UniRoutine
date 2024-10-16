package co.ucentral.BackEnd_UniRoutine.controlador;

import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Evento;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Recordatorio;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Tarea;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Usuario;
import co.ucentral.BackEnd_UniRoutine.servicios.RecordatorioServicio;
import co.ucentral.BackEnd_UniRoutine.servicios.TareaServicio;
import co.ucentral.BackEnd_UniRoutine.servicios.UsuarioServicio;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/recordatorios")
public class RecordatorioControlador {
    @Autowired
    RecordatorioServicio recordatorioServicio;
    @Autowired
    UsuarioServicio usuarioServicio;

    @GetMapping("/usuario/{idUsuario}")
    public List<Recordatorio> obtenerRecordatoriosPorUsuario(@PathVariable int idUsuario) {
        Usuario usuario = usuarioServicio.consultarUsuarioPorId(idUsuario);
        return recordatorioServicio.obtenerRecordatoriosPorUsuario(usuario);
    }

}


