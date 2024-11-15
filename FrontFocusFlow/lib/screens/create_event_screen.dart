import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class CreateEventScreen extends StatefulWidget {
  @override
  _CreateEventScreenState createState() => _CreateEventScreenState();
}

class _CreateEventScreenState extends State<CreateEventScreen> {
  final TextEditingController titleController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();
  final TextEditingController locationController = TextEditingController();

  // Controlador para la fecha del evento
  DateTime? _eventDate;

  // Variables para prioridad
  int? _priority;
  
  // Lista de opciones de prioridad
  final List<int> priorities = [1, 2, 3, 4, 5]; // 1 es la mayor prioridad

  // Fecha de creación (se puede obtener automáticamente con LocalDateTime)
  final String _creationDate = DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now());

  // Método para seleccionar la fecha
  Future<void> _selectEventDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );

    if (picked != null && picked != _eventDate)
      setState(() {
        _eventDate = picked;
      });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Crear Evento')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: titleController,
              decoration: InputDecoration(labelText: 'Título del evento'),
            ),
            TextField(
              controller: descriptionController,
              decoration: InputDecoration(labelText: 'Descripción del evento'),
              maxLines: 3,
            ),
            SizedBox(height: 20),

            // Campo de ubicación
            TextField(
              controller: locationController,
              decoration: InputDecoration(labelText: 'Ubicación'),
            ),
            SizedBox(height: 20),

            // Selección de la fecha del evento
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _eventDate == null
                      ? 'Fecha del evento: No seleccionada'
                      : 'Fecha del evento: ${DateFormat('yyyy-MM-dd').format(_eventDate!)}',
                  style: TextStyle(fontSize: 16),
                ),
                ElevatedButton(
                  onPressed: () => _selectEventDate(context),
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

            ElevatedButton(
              onPressed: () {
                // Aquí puedes hacer la llamada al backend para guardar el evento
                final evento = {
                  'titulo': titleController.text,
                  'descripcion': descriptionController.text,
                  'fecha': _eventDate?.toIso8601String(),
                  'prioridad': _priority,
                  'fechaCreacion': _creationDate,
                  'ubicacion': locationController.text,
                  // Aquí debes incluir el id del usuario, que puedes obtener de alguna manera
                  'id_usuario': 1, // Este valor debería ser dinámico
                };

                print('Evento creado: $evento');
                // Aquí puedes agregar la lógica para enviar los datos al backend.
              },
              child: Text('Guardar Evento'),
            ),
          ],
        ),
      ),
    );
  }
}
