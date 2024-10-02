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
@Table(name = "notificacion")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Notificacion {
    @Id
    private int id_notificacion;
    private int id_usuario;
    private String tipo;
    private Date fecha_hora;
    private String mensaje;

}
