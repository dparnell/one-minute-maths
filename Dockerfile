FROM alpine:3.5
MAINTAINER Daniel Parnell <me@danielparnell.com>

RUN apk update && \
    apk add apache2 bash openrc php5-apache2 php5-json php5-sqlite3 && \
    rm -rf /var/cache/apk/* && \
    sed -i s/80/8080/g /etc/apache2/httpd.conf && \
    mkdir -p /run/apache2 && \
    ln -sf /dev/stdout /var/log/apache2/access.log && \
    ln -sf /dev/stderr /var/log/apache2/error.log && \
    chmod a+w /var/log/apache2/*.log && \
    chmod a+w /run/apache2 && \
    chmod a+rwx /var/log/apache2

WORKDIR /var/www/localhost/htdocs
VOLUME ["/var/www/localhost/htdocs"]
EXPOSE 8080

CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]
