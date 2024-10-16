package co.ucentral.BackEnd_UniRoutine.persistencia.entidades;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "evento")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Evento {
    @Id
    private int id_evento;
    private String titulo;
    private String descripcion;
    private Integer prioridad;
    private LocalDateTime fechaCreacion;
    private String ubicacion;


    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL)
    private List<Recordatorio> recordatorios;


}
