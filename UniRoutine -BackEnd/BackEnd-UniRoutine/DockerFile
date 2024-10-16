# Usar la imagen base de Amazon Corretto
FROM amazoncorretto:21-alpine-jdk

# Etiqueta del autor
LABEL authors="@Jquirozp"

# Copiar el archivo JAR de la aplicación al contenedor
COPY target/BackEnd-UniRoutine-0.0.1-SNAPSHOT.jar app.jar

# Establecer el punto de entrada para la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
