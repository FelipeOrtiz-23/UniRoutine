class Tarea {
  String id;
  String titulo;
  String descripcion;
  DateTime fechaCreacion;
  DateTime? fechaVencimiento;

  Tarea({
    required this.id,
    required this.titulo,
    required this.descripcion,
    required this.fechaCreacion,
    this.fechaVencimiento,
  });
}
