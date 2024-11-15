import 'package:flutter/material.dart';
import 'package:intl/intl.dart' as intl;

class CreateTaskScreen extends StatefulWidget {
  @override
  _CreateTaskScreenState createState() => _CreateTaskScreenState();
}

class _CreateTaskScreenState extends State<CreateTaskScreen> {
  final TextEditingController titleController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();
  final TextEditingController categoryController = TextEditingController();

  // Controlador para la fecha de vencimiento
  DateTime? _dueDate;

  // Variables para prioridad y estado
  int? _priority;
  String _status = 'Pendiente'; // Puedes agregar más estados si es necesario

  // Lista de opciones de prioridad
  final List<int> priorities = [1, 2, 3, 4, 5]; // 1 es la mayor prioridad

  // Fecha de creación (se puede obtener automáticamente con LocalDateTime)
  final String _creationDate = intl.DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now());

  // Método para seleccionar la fecha
  Future<void> _selectDueDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );

    if (picked != null && picked != _dueDate)
      setState(() {
        _dueDate = picked;
      });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Crear Tarea')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: titleController,
              decoration: InputDecoration(labelText: 'Título de la tarea'),
            ),
            TextField(
              controller: descriptionController,
              decoration: InputDecoration(labelText: 'Descripción de la tarea'),
              maxLines: 3,
            ),
            SizedBox(height: 20),

            // Campo de categoría
            TextField(
              controller: categoryController,
              decoration: InputDecoration(labelText: 'Categoría'),
            ),
            SizedBox(height: 20),

            // Selección de la fecha de vencimiento
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _dueDate == null
                      ? 'Fecha de vencimiento: No seleccionada'
                      : 'Fecha de vencimiento: ${intl.DateFormat('yyyy-MM-dd').format(_dueDate!)}',
                  style: TextStyle(fontSize: 16),
                ),
                ElevatedButton(
                  onPressed: () => _selectDueDate(context),
                  child: Text('Seleccionar Fecha'),
                ),
              ],
            ),
            SizedBox(height: 20),

            // Selector de prioridad
            DropdownButtonFormField<int>(
              value: _priority,
              decoration: InputDecoration(labelText: 'Prioridad'),
              items: priorities.map((int priority) {
                return DropdownMenuItem<int>(
                  value: priority,
                  child: Text('Prioridad $priority'),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _priority = value;
                });
              },
            ),
            SizedBox(height: 20),

            // Selector de estado
            DropdownButtonFormField<String>(
              value: _status,
              decoration: InputDecoration(labelText: 'Estado'),
              items: ['Pendiente', 'En progreso', 'Completada'].map((String status) {
                return DropdownMenuItem<String>(
                  value: status,
                  child: Text(status),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _status = value!;
                });
              },
            ),
            SizedBox(height: 20),

            ElevatedButton(
              onPressed: () {
                // Aquí puedes hacer la llamada al backend para guardar la tarea
                final tarea = {
                  'titulo': titleController.text,
                  'descripcion': descriptionController.text,
                  'fecha_vencimiento': _dueDate?.toIso8601String(),
                  'prioridad': _priority,
                  'fechaCreacion': _creationDate,
                  'categoria': categoryController.text,
                  'estado': _status,
                  // Aquí debes incluir el id del usuario, que puedes obtener de alguna manera
                  'id_usuario': 1, // Este valor debería ser dinámico
                };

                print('Tarea creada: $tarea');
                // Aquí puedes agregar la lógica para enviar los datos al backend.
              },
              child: Text('Guardar Tarea'),
            ),
          ],
        ),
      ),
    );
  }
}
