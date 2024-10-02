package co.ucentral.BackEnd_UniRoutine.persistencia.entidades;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.util.Date;

@Entity
@Table(name = "calendario")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Calendario {
    @Id
    private int id_calendario;
    private Date fecha;
    private String tipo_evento;

}
