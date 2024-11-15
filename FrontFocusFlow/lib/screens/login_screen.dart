import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:frontfocusflow/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginScreen extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final MyApp data = MyApp();

  //metodo que valida el usuario
  Future<bool> validarUsuario(String correo, String contrasena) async {
    final url = Uri.parse('https://uniroutine.onrender.com/usuarios/validar'); // Cambia la URL a la de tu backend

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'correo': correo,
          'contrasena': contrasena,
        }),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final String id = data['id'].toString();
        await saveToSharedPreferences('id', id);
        return true; 
        // Asegúrate de que el backend devuelva {"valid": true}
      } else if (response.statusCode == 400) {
        // Código para credenciales incorrectas
        return false;
      } else {
        throw Exception('Error en el servidor');
      }
    } catch (e) {
      print('Error al validar el usuario: $e');
      throw Exception('Error de conexión al validar el usuario');
    }
  }

  // Guardar datos
  Future<void> saveToSharedPreferences(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setString(key, value);
  }

  // // Método para limpiar las SharedPreferences
  // Future<void> clearSharedPreferences() async {
  //   final prefs = await SharedPreferences.getInstance();
  //   await prefs.clear(); // Limpia todas las preferencias guardadas
  // }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Login'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Bienvenido a FocusFlow, por favor inicia sesión',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 30),
            TextField(
              controller: emailController,
              decoration: InputDecoration(
                labelText: 'Correo electrónico',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 15),
            TextField(
              controller: passwordController,
              decoration: InputDecoration(
                labelText: 'Contraseña',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final correo = emailController.text;
                final contrasena = passwordController.text;
                
                if (correo.isNotEmpty && contrasena.isNotEmpty) {
                  try {
                    final isValid = await validarUsuario(correo, contrasena);
                    if (isValid) {
                      // await clearSharedPreferences(); // Limpia las preferencias antes de guardar el nuevo usuario
                      // await data.saveToSharedPreferences('correo', correo);
                      // await data.saveToSharedPreferences('nombre', "Cristiano Ronaldo");

                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Usuario válido. ¡Bienvenido!')),
                      );
                      Navigator.pushNamed(context, '/home'); // Navega a la pantalla principal
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Correo o contraseña incorrectos.')),
                      );
                    }
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error de validación: $e')),
                    );
                  }
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Por favor, ingresa un correo y contraseña válidos')),
                  );
                }
              },
              child: Text('Ingresar'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pushNamed(context, '/register');
              },
              child: Text('Crear cuenta'),
            ),
          ],
        ),
      ),
    );
  }
}
