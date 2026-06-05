# Usar JDK 17
FROM eclipse-temurin:17-jdk

# Definir diretório de trabalho
WORKDIR /app

# Copiar tudo para dentro do container
COPY . .

# Dar permissão ao gradlew (se precisar rodar localmente)
RUN chmod +x prova/gradlew

# Comando de inicialização da aplicação
CMD ["java", "-jar", "prova/build/libs/prova-0.0.1-SNAPSHOT.jar"]
