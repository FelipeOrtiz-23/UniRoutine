package co.ucentral.BackEnd_UniRoutine.persistencia.repositorios;

import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Evento;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Proceso;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcesoRepositorio extends CrudRepository<Proceso, Integer> {
}
