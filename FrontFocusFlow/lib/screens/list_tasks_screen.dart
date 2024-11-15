import 'package:flutter/material.dart';

class Task {
  final int idTarea;
  final String titulo;
  final String descripcion;
  final String categoria;
  final String estado;
  final DateTime fechaVencimiento;
  final int prioridad;

  Task({
    required this.idTarea,
    required this.titulo,
    required this.descripcion,
    required this.categoria,
    required this.estado,
    required this.fechaVencimiento,
    required this.prioridad,
  });
}

class ListTasksScreen extends StatelessWidget {
  // Simulación de una lista de tareas (esto normalmente vendría de una API)
  final List<Task> tareas = [
    Task(
      idTarea: 1,
      titulo: 'Tarea 1',
      descripcion: 'Descripción de la tarea 1',
      categoria: 'Trabajo',
      estado: 'Pendiente',
      fechaVencimiento: DateTime(2024, 11, 15),
      prioridad: 2,
    ),
    Task(
      idTarea: 2,
      titulo: 'Tarea 2',
      descripcion: 'Descripción de la tarea 2',
      categoria: 'Estudio',
      estado: 'En Progreso',
      fechaVencimiento: DateTime(2024, 11, 18),
      prioridad: 3,
    ),
    // Puedes agregar más tareas aquí
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Lista de Tareas'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: ListView.builder(
          itemCount: tareas.length,
          itemBuilder: (context, index) {
            final tarea = tareas[index];
            return Card(
              margin: EdgeInsets.symmetric(vertical: 8.0),
              elevation: 4.0,
              child: ListTile(
                title: Text(tarea.titulo),
                subtitle: Text(
                  '${tarea.descripcion}\n${tarea.categoria} - ${tarea.estado}',
                  style: TextStyle(color: Colors.grey[600]),
                ),
                trailing: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Vence: ${tarea.fechaVencimiento.toLocal().toString().split(' ')[0]}',
                      style: TextStyle(fontSize: 12.0, color: Colors.blue),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'Prioridad: ${tarea.prioridad}',
                      style: TextStyle(fontSize: 12.0, color: Colors.red),
                    ),
                  ],
                ),
                onTap: () {
                  // Puedes agregar una acción al tocar la tarea
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Tarea ${tarea.titulo} seleccionada')),
                  );
                },
              ),
            );
          },
        ),
      ),
    );
  }
}
