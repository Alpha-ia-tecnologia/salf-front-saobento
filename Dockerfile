FROM nginx:stable



RUN rm -rf /var/www/html/salf
RUN rm /etc/nginx/conf.d/default.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /var/www/html/salf/erro
COPY ./404.html /var/www/html/salf/erro

ARG CACHEBUST=1



COPY . /var/www/html/salf/

EXPOSE 8080

    

