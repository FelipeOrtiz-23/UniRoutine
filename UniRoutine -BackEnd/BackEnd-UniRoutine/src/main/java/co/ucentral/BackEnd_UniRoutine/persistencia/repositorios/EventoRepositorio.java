package co.ucentral.BackEnd_UniRoutine.persistencia.repositorios;

import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Calendario;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Evento;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoRepositorio  extends CrudRepository<Evento, Integer> {
}
