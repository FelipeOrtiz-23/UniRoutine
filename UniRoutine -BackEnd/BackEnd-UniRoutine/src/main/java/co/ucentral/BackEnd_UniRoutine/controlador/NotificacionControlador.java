package co.ucentral.BackEnd_UniRoutine.controlador;

import co.ucentral.BackEnd_UniRoutine.servicios.NotificacionServicio;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class NotificacionControlador {
    NotificacionServicio notificacionServicio;
}
