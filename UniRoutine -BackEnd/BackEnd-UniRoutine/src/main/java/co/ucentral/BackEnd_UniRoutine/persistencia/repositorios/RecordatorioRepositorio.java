package co.ucentral.BackEnd_UniRoutine.persistencia.repositorios;

import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Evento;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Recordatorio;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Usuario;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordatorioRepositorio extends CrudRepository<Recordatorio, Integer> {
        List<Recordatorio> findByUsuario(Usuario idUsuario);
}