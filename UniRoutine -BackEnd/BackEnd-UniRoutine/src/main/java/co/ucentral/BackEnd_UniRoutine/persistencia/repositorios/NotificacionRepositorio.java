package co.ucentral.BackEnd_UniRoutine.persistencia.repositorios;

import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Evento;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Notificacion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificacionRepositorio extends CrudRepository<Notificacion, Integer> {
}

