upstream backend_servers {
    server 127.0.0.1:8888;  # 配置后端服务的地址和端口
}

server {
    listen 80;  # 监听 80 端口
    server_name news.ideachorus.com;  # 替换为你的域名

    location / {
        proxy_pass http://backend_servers;  # 转发请求到后端服务
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";  # 注意：这里的 Connection 之前可能缺少空格
        proxy_connect_timeout 10;
        proxy_read_timeout 30;
    }
}
