package co.ucentral.BackEnd_UniRoutine.servicios;

import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Recordatorio;
import co.ucentral.BackEnd_UniRoutine.persistencia.entidades.Usuario;
import co.ucentral.BackEnd_UniRoutine.persistencia.repositorios.RecordatorioRepositorio;
import co.ucentral.BackEnd_UniRoutine.persistencia.repositorios.UsuarioRepositorio;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class RecordatorioServicio {
    @Autowired
    RecordatorioRepositorio recordatorioRepositorio;

    //obtener recordatorio por id de usuario
    public List<Recordatorio> obtenerRecordatoriosPorUsuario(Usuario usuario) {
        return recordatorioRepositorio.findByUsuario(usuario);
    }
    //crear recordatorio
    public Recordatorio crearRecordatorio(Recordatorio recordatorio) {
        return recordatorioRepositorio.save(recordatorio);
    }

}

