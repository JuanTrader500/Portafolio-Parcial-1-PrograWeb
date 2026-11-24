FROM nginx:stable-alpine

LABEL org.opencontainers.image.title="Portafolio de Juan Andrés Muñoz Zapata" \
      org.opencontainers.image.description="Portafolio terminal estático servido con Nginx" \
      org.opencontainers.image.source="https://github.com/JuanTrader500/Portafolio-Parcial-1-PrograWeb"

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY project_code/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/healthz | grep -q ok || exit 1
