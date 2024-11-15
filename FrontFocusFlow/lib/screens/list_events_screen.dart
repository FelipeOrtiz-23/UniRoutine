import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

  class Evento {
  final String titulo;
  final String descripcion;
  final String prioridad;
  final DateTime fechaCreacion;
  final String ubicacion;

  Evento({
    required this.titulo,
    required this.descripcion,
    required this.prioridad,
    required this.fechaCreacion,
    required this.ubicacion,
  });

  // Método para crear un objeto Evento a partir de un JSON
  factory Evento.fromJson(Map<String, dynamic> json) {
    return Evento(
      titulo: json['titulo'] ?? '',
      descripcion: json['descripcion'] ?? '',
      prioridad: json['prioridad'] ?? '',
      fechaCreacion: DateTime.parse(json['fechaCreacion'] ?? ''),
      ubicacion: json['ubicacion'] ?? '',
    );
  }
}

  class ListarEventos extends StatefulWidget {
  @override
  ListEventsScreen createState() => ListEventsScreen();
  }

  class ListEventsScreen extends State<ListarEventos> {
  Future<String?> getFromSharedPreferences(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }
  Future<List<Evento>> obtenerData() async {
    final url = Uri.parse('https://uniroutine.onrender.com/tareas/usuario'); // Cambia la URL a la de tu backend
    try {
      // Recupera el ID de usuario desde las preferencias compartidas
      int id = int.parse(await getFromSharedPreferences('id') ?? '0');
      // Realiza la petición al backend con el ID del usuario
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'id': id}),
      );
      if (response.statusCode == 200) { 
        // Decodifica la respuesta y convierte cada item en un objeto Evento
        List<dynamic> jsonList = jsonDecode(response.body);
        return jsonList.map((item) => Evento.fromJson(item)).toList();   
        
      } else {
        throw Exception('Failed to load user data');
      }
    } catch (e) {
      throw Exception('Failed to load user data: $e');
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Lista de Eventos'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: FutureBuilder<List<Evento>>(
          future: obtenerData(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(child: Text('Error: ${snapshot.error}'));
            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return Center(child: Text('No hay eventos disponibles'));
            } else {
              final eventos = snapshot.data!;
              return ListView.builder(
                itemCount: eventos.length,
                itemBuilder: (context, index) {
                  final evento = eventos[index];
                  return Card(
                    margin: EdgeInsets.symmetric(vertical: 8.0),
                    elevation: 4.0,
                    child: ListTile(
                      title: Text(evento.titulo),
                      subtitle: Text(
                        '${evento.descripcion}\nUbicación: ${evento.ubicacion}',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      trailing: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Fecha: ${evento.fechaCreacion.toLocal().toString().split(' ')[0]}',
                            style: TextStyle(fontSize: 12.0, color: Colors.blue),
                          ),
                          SizedBox(height: 4.0),
                          Text(
                            'Prioridad: ${evento.prioridad}',
                            style: TextStyle(fontSize: 12.0, color: Colors.red),
                          ),
                        ],
                      ),
                      onTap: () {
                        // Acción cuando se selecciona un evento
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Evento ${evento.titulo} seleccionado')),
                        );
                      },
                    ),
                  );
                },
              );
            }
          },
        ),
      ),
    );
  }
}
