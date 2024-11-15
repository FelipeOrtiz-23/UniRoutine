import 'package:flutter/material.dart';


class Home extends StatelessWidget {
  const Home({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('FocusFlow Home'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // GIF
            Image.asset('assets/gif/FocusFlow.gif'),//Ruta de tu archivo GIF en los assets
            // Image.asset(
            //   'assets/', //Ruta de tu archivo GIF en los assets
            //   height: 150, // Tamaño del GIF
            //   width: 150,
            // ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/createTask');
              },
              child: Text('Crear Tarea'),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/createEvent');
              },
              child: Text('Crear Evento'),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/listTasks');
              },
              child: Text('Listar Tareas'),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/listEvents');
              },
              child: Text('Listar Eventos'),
            ),
          ],
        ),
      ),
    );
  }
}
