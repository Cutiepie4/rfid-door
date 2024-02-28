from bson import Regex
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_socketio import SocketIO
from flask_jwt_extended import jwt_required, JWTManager, get_jwt_identity, create_access_token
from datetime import datetime
import uuid, json, os

client = MongoClient('mongodb://localhost:27017')
db = client['rfid_door']
entry_logs_collection = db['entry_logs']
users_collection = db['users']

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'ok'
jwt = JWTManager(app)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

esp8266_host = "http://192.168.1.243";

from flask import jsonify

@app.route('/enable-checkin', methods=['GET'])
def enable_checkin():
    import requests
    requests.get(esp8266_host + '/checkin')
    socketio.emit('/enable', {})
    return jsonify('Bật chế độ checkin', 200)

@app.route('/enable-register', methods=['GET'])
def enable_register():
    import requests
    socketio.emit('/disable', {})
    requests.get(esp8266_host + '/register')
    return jsonify('Bật chế độ register', 200)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    card_id = data.get('card_id')
    name = data.get('name')

    existing_user = users_collection.find_one({'card_id': card_id})

    if existing_user:
        users_collection.update_one({'card_id': card_id}, {'$set': {'name': name, 'time': datetime.now()}})
        return jsonify({"message": "Đã cập nhật thành viên!"}), 200
    else:
        data['time'] = datetime.now()
        users_collection.insert_one(data)
        return jsonify({"message": "Thêm thành viên mới thành công!"}), 200

@app.route('/get-list-entry-logs', methods=['GET'])
def get_list_entry_logs():
    entry_logs = entry_logs_collection.find({})
    entry_logs_gte = []
    for entry in entry_logs:
        print(users_collection.find_one({'card_id': entry['card_id']}))
        entry['name'] = users_collection.find_one({'card_id': entry['card_id']})['name']
        entry['_id'] = str(entry['_id'])
        entry['time'] = entry['time'].isoformat()
        entry_logs_gte.append(entry)
    
    return jsonify(entry_logs_gte[::-1]), 200

@app.route('/read-register', methods=['POST'])
def read_register():
    card = request.get_json()
    socketio.emit('/register', card['card_id'])
    return jsonify('Đọc thẻ thành công ' + card['card_id']), 200

@app.route('/read-checkin', methods=['POST'])
def read_checkin():
    data = request.get_json()
    data['time'] = datetime.now()
    card_id = data.get('card_id')
    user = users_collection.find_one({'card_id': card_id})

    if(user != None):
        entry_logs_collection.insert_one(data)
        data['_id'] = str(data['_id'])
        data['time'] = data['time'].isoformat()
        data['name'] = user['name']
        import requests
        requests.get(esp8266_host + '/green-led-on')
        requests.get(esp8266_host + '/open-door')
        if requests.get(esp8266_host + '/door-status').text != 'close':
            socketio.emit('/checkin', data)
            print(requests.get(esp8266_host + '/door-status').text == 'close')
        return jsonify('Mở cửa!', 200)
    else:
        import requests
        requests.get(esp8266_host + '/red-led-on')
        return jsonify('Thành viên chưa được đăng ký. Không mở cửa!', 200)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', debug=True)