Cách sử dụng docker để deployment

Mọi thứ đã được chuẩn bị hết, chỉ việc chạy lệnh docker compose

docker compose up

Chạy chỉ thấy tên container, ẩn logs và terminal

docker compose up -d

Nếu chạy từng cái thì phải build từng image sử dụng dockerfile đã được upload sẵn

docker build -t backend ./Comic
docker build -t frontemd ./ComicReaderSite

docker run -d backend
docker run -d frontend

Đã expose hết port nên không cần đính port vào
Nếu server không lên, sử dụng docker ps -a để kiểm tra

Đối với deployment lên server sẽ nói sau, do sử dụng gh actions để build lên azure tự động
