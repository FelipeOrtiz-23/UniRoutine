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
@Table(name = "tarea")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Tarea {
    @Id
    private int id_tarea;
    private String titulo;
    private String descripcion;
    private Date fecha_vencimiento;
    private String prioridad;
    private String categoria;
    private String estado;
    private int id_usuario;
}
