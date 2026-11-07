# Gestiq — Rafael Silva Gomes

Sistema de gestão de projetos desenvolvido com Django REST Framework e React.

## Execução local

O backend usa SQLite localmente quando `POSTGRES_HOST` não está configurado. O
frontend usa `VITE_API_URL` em desenvolvimento e, em produção, acessa a API no
mesmo domínio da aplicação.

## Deploy no Coolify

O repositório contém um `docker-compose.yml` pronto para o Coolify com:

- frontend React servido por Nginx;
- backend Django executado com Gunicorn;
- PostgreSQL com volume persistente;
- volume persistente para fotos;
- migrações e arquivos estáticos aplicados automaticamente;
- domínio e segredos gerados automaticamente pelo Coolify.

No Coolify, crie uma aplicação a partir deste repositório, selecione **Docker
Compose** como estratégia de build e use `/docker-compose.yml` como arquivo de
Compose. O serviço público é `frontend`, na porta interna `80`.
