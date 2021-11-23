# Imagen de Node minificada para la construcción de archivos
FROM node:14-slim AS builder

# Instalar dependencias del SO
RUN apt update && apt install -y \
  openssl \
  && rm -rf /var/lib/apt/lists/*

# Configura carpeta de construcción con los permisos correctos
RUN mkdir -p /opt/app && chown -R node:node /opt/app
WORKDIR /opt/app

# Cambia un usuario no-root
USER node

# Copia los archivos de dependencias
COPY --chown=node:node package.json yarn.lock ./

# Instala dependencias
RUN yarn install --no-optional && yarn cache clean --all

# Copia los archivos de código
COPY . .

# Genera configuración del cliente de prisma
RUN yarn generate:prisma

# Construye código de producción
RUN yarn build


# Imagen de Node minificada para "servir" el código optimizado
FROM node:14-slim as prd

# Instalar dependencias del SO
RUN apt update && apt install -y \
  openssl \
  && rm -rf /var/lib/apt/lists/*

# Define el entorno de Node (development o production)
# Por defecto es production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# La aplicación por defecto se expone en el puerto 7000
ARG PORT=5000
ENV PORT $PORT
EXPOSE $PORT

# Añade un manejador de señales para aplicaciones Node
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# Configura carpeta de la aplicación con los permisos correctos
RUN mkdir /opt/app && chown node:node /opt/app
WORKDIR /opt/app

# Cambia a usuario no-root
USER node

# Copia archivos de definición de dependencias
COPY --chown=node:node package.json yarn.lock ./

# Instalar dependencias de producción
RUN rm -rf node_modules \
  && yarn install --no-optional \
  && yarn cache clean --all

# Copia el código generado y archivos opcionales
# - Copia código generado de la carpeta `dist`
COPY --from=builder --chown=node:node /opt/app/dist ./dist

# - Copia archivo de configuración del ORM
COPY --from=builder --chown=node:node /opt/app/prisma ./prisma

# Copia el archivo de punto de entrada
COPY --from=builder --chown=node:node /opt/app/index.js ./index.js

# Genera configuración del cliente de prisma
RUN yarn generate:prisma

# Inicia aplicación
CMD [ "node", "index.js" ]