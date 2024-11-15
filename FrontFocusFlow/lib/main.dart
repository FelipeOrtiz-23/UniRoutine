import 'package:flutter/material.dart';
import 'package:frontfocusflow/screens/login_screen.dart';
import 'package:frontfocusflow/screens/register_screen.dart';
import 'package:frontfocusflow/screens/create_task_screen.dart';
import 'package:frontfocusflow/screens/create_event_screen.dart';
import 'package:frontfocusflow/screens/list_tasks_screen.dart';
import 'package:frontfocusflow/screens/list_events_screen.dart';
import 'package:frontfocusflow/screens/home.dart';
import 'package:shared_preferences/shared_preferences.dart';



void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {

    // Guardar datos
  Future<void> saveToSharedPreferences(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setString(key, value);
  }

  // Obtener datos
Future<String?> getFromSharedPreferences(String key) async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString(key);
}

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gestor de Tareas',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color.fromARGB(255, 12, 66, 174),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => LoginScreen(),
        '/register': (context) => RegisterScreen(),
        '/createTask': (context) => CreateTaskScreen(),
        '/createEvent': (context) => CreateEventScreen(),
        '/listTasks': (context) => ListTasksScreen(),
        '/listEvents': (context) => ListarEventos(),
        '/home': (context) => Home()
      },
    );
  }
}
