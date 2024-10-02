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
@Table(name = "proceso")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Proceso {
    @Id
    private int id_proceso;
    private int id_tarea;
    private double porcentaje;
    private Date fecha_registro;
}
