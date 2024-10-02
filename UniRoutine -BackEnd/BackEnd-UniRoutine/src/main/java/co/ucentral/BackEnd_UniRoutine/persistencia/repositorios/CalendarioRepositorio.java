package co.ucentral.BackEnd_UniRoutine.persistencia.repositorios;

import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Calendario;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalendarioRepositorio  extends CrudRepository<Calendario, Integer> {
}
