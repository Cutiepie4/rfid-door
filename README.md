1. backend
  - cd be
  - pip install flask flask_cors pymongo flask_socketio flask_jwt_extended
  - run: python main.py
  - làm bước 3 trước, sau đó nhìn cái màn hình serial trên arduino sửa ip của biến esp8266_host
2. frontend
  - cd fe
  - npm install
  - npm start
3. arduino
  - mở code .ino trong arduino
  - sửa tên + pass wifi, laptop + esp cần kết nối chung wifi
  - sửa host thành ip của laptop
  - mở arduino add .zip library 2 cái file esp ở dưới
[ESPAsyncWebServer-master.zip](https://github.com/Cutiepie4/rfid-door/files/14436539/ESPAsyncWebServer-master.zip)
[ESPAsyncTCP-master.zip](https://github.com/Cutiepie4/rfid-door/files/14436538/ESPAsyncTCP-master.zip)
  - cắm esp vào laptop: vào device manager update driver bằng cách trỏ vào thư mục ch341 đã giải nén
[CH341SER.zip](https://github.com/Cutiepie4/rfid-door/files/14436542/CH341SER.zip)
  - cài các thư viện 
![image](https://github.com/Cutiepie4/rfid-door/assets/105115559/043d4270-329b-408f-a9e1-af3703f83fc1)
![image](https://github.com/Cutiepie4/rfid-door/assets/105115559/2a6621d0-1c4a-4f16-9278-f31c2ea00ce2)
  - nạp code vào esp
4. tải mongodb community, tạo database tên rfid_door, tạo 2 collection tên: users + entry_logs
5. Mô tả
[MoTaBTL.docx](https://github.com/Cutiepie4/rfid-door/files/14438179/MoTaBTL.docx)
