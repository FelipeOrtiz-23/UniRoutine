package co.ucentral.BackEnd_UniRoutine.servicios;

import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Tarea;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Usuario;
import co.ucentral.BackEnd_UniRoutine.persistencia.repositorios.TareaRepositorio;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class TareaServicio {
    @Autowired
    TareaRepositorio tareaRepositorio;

    //obetener una tarea por id
    public List<Tarea> obtenerTareasPorUsuarioOrdenadasPorPrioridad(Usuario usuario) {
        return tareaRepositorio.findByUsuarioOrderByPrioridadAsc(usuario);
    }

    //metodo para guardar una tarea
    public Tarea guardarTarea(Tarea tarea) {
        return tareaRepositorio.save(tarea);
    }
    //eliminar una tarea
    public void eliminarTarea(Integer id){
        tareaRepositorio.deleteById(id);
    }
    //comsultar una tarea por id
    public Tarea consultarTareaPorId(Integer id){
        return tareaRepositorio.findById(id).orElse(null);
    }
}
