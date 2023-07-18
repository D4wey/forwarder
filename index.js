http {
  map $http_host $target {
    default "";
    playtopus.net http://86.93.13.243:8500/;
    www.playtopus.net http://86.93.13.243:8500/;
    blackbullstudio.eu http://86.93.13.243:83/;
    www.blackbullstudio.eu http://86.93.13.243:83/;
    gpanel.blackbullstudio.eu http://86.93.13.243:8080/;
    assets.blackbullstudio.eu http://86.93.13.243:81/;
  }

  map $http_host$request_user_agent $user_key {
    default "";
    "~^([^:]+):([^:]+):" "$1-$2";
  }

  limit_req_zone $user_key zone=limit:10m rate=1r/s;

  server {
    listen 80;
    server_name _;

    location / {
      if ($target = "") {
        return 403 "Access Forbidden";
      }
      
      if ($http_host !~ ^(playtopus.net|www.playtopus.net|ddos-guard.dns.central-eu.playtopus.net|blackbullstudio.eu|www.blackbullstudio.eu|gpanel.blackbullstudio.eu|assets.blackbullstudio.eu)$) {
        return 403 "Access Forbidden";
      }

      limit_req zone=limit burst=2 nodelay;

      proxy_pass $target;
      proxy_set_header Host $http_host;
    }
  }

  error_page 403 /error403;

  location = /error403 {
    return 403 "Forbidden";
  }
}
