package co.ucentral.BackEnd_UniRoutine.servicios;

import co.ucentral.BackEnd_UniRoutine.excepciones.ResourceNotFoundException;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Evento;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Tarea;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Usuario;
import co.ucentral.BackEnd_UniRoutine.persistencia.repositorios.EventoRepositorio;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class EventoServicio {
    EventoRepositorio eventoRepositorio;

    //obetener un evento por id
    public List<Evento> obtenerEventosPorUsuarioOrdenadosPorPrioridad(Usuario usuario) {
        return eventoRepositorio.findByUsuarioOrderByPrioridadAsc(usuario);
    }
    //metodo para guardar un evento
    public Evento guardarEvento(Evento evento) {
        return eventoRepositorio.save(evento);
    }
    //eliminar una tarea
    public void eliminarEvento(Integer id){
        eventoRepositorio.deleteById(id);
    }
    //comsultar una tarea por id
    public Evento consultarEventoPorId(Integer id){
        return eventoRepositorio.findById(id).orElse(null);
    }
}
