# Usar uma imagem oficial do JDK 17
FROM eclipse-temurin:17-jdk

# Definir diretório de trabalho
WORKDIR /app

# Copiar tudo para dentro do container
COPY . .

# Dar permissão ao gradlew
RUN chmod +x prova/gradlew

# Comando padrão (Render substitui pelo startCommand do render.yaml)
CMD ["java", "-jar", "prova/build/libs/sistema-0.0.1-SNAPSHOT.jar"]
