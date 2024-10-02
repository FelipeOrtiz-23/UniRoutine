package co.ucentral.BackEnd_UniRoutine.servicios;

import co.ucentral.BackEnd_UniRoutine.persistencia.repositorios.RecordatorioRepositorio;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class RecordatorioServicio {
    RecordatorioRepositorio recordatorioRepositorio;
}
