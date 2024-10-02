package co.ucentral.BackEnd_UniRoutine.controlador;

import co.ucentral.BackEnd_UniRoutine.servicios.UsuarioServicio;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class UsuarioControlador {
    UsuarioServicio usuarioServicio;

}
