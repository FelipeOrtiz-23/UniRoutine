package co.ucentral.BackEnd_UniRoutine.persistencia.entidades;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "recordatorio")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Recordatorio {
    @Id
    private int id_recordatorio;
    private String mensaje;
    private String tipo;
    private Date fecha_hora;
    private String estado;
    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;
    @ManyToOne
    @JoinColumn(name = "id_tarea", nullable = false)
    private Tarea tarea;
    @ManyToOne
    @JoinColumn(name = "id_evento", nullable = false)
    private Evento evento;
}
