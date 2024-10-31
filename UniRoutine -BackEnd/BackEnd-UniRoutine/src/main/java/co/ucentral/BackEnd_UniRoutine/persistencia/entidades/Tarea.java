package co.ucentral.BackEnd_UniRoutine.persistencia.entidades;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

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
    private Integer prioridad;
    private LocalDateTime fechaCreacion;
    private String categoria;
    private String estado;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    @JsonBackReference
    private Usuario usuario;

    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL)
    private List<Recordatorio> recordatorios;

}
