from flask import Flask, request, jsonify, send_file
from Crypto.Cipher import AES
import os
import hashlib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api', methods=['GET'])
def api():
    return jsonify({'message': 'Welcome to the File Encryption API!'})

# Config paths
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ENCRYPTED_FOLDER'] = 'encrypted'
app.config['DECRYPTED_FOLDER'] = 'decrypted'

# Create folders if they don't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['ENCRYPTED_FOLDER'], exist_ok=True)
os.makedirs(app.config['DECRYPTED_FOLDER'], exist_ok=True)

# Simulated malware signatures
MALWARE_SIGNATURES = [b'evilcode123', b'trojan.exe', b'virus_payload']

def pad(data):
    return data + b"\0" * (AES.block_size - len(data) % AES.block_size)

def unpad(data):
    return data.rstrip(b"\0")

def scan_for_malware(file_data):
    return any(signature in file_data for signature in MALWARE_SIGNATURES)

def generate_aes_key(password="default_secret"):
    return hashlib.sha256(password.encode()).digest()

def encrypt_data(key, data):
    cipher = AES.new(key, AES.MODE_CBC)
    iv = cipher.iv
    encrypted = cipher.encrypt(pad(data))
    return iv + encrypted

def decrypt_data(key, data):
    iv = data[:AES.block_size]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted = cipher.decrypt(data[AES.block_size:])
    return unpad(decrypted)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    filename = file.filename
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    with open(file_path, 'rb') as f:
        data = f.read()

    if scan_for_malware(data):
        os.remove(file_path)
        return jsonify({'status': 'blocked', 'message': 'Malware detected and upload blocked.'}), 400

    key = generate_aes_key()
    encrypted_data = encrypt_data(key, data)
    encrypted_filename = f'encrypted_{filename}'
    encrypted_path = os.path.join(app.config['ENCRYPTED_FOLDER'], encrypted_filename)

    with open(encrypted_path, 'wb') as f:
        f.write(encrypted_data)

    os.remove(file_path)

    return jsonify({
        'status': 'encrypted',
        'message': 'File encrypted successfully.',
        'filename': encrypted_filename
    }), 200

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    file_path = os.path.join(app.config['ENCRYPTED_FOLDER'], filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404

    return send_file(file_path, as_attachment=True)

@app.route('/decrypt/<filename>', methods=['GET'])
def decrypt_file(filename):
    encrypted_path = os.path.join(app.config['ENCRYPTED_FOLDER'], filename)

    if not os.path.exists(encrypted_path):
        return jsonify({'error': 'Encrypted file not found'}), 404

    with open(encrypted_path, 'rb') as f:
        encrypted_data = f.read()

    key = generate_aes_key()
    decrypted_data = decrypt_data(key, encrypted_data)

    original_filename = filename.replace("encrypted_", "", 1)
    decrypted_filename = f'decrypted_{original_filename}'
    decrypted_path = os.path.join(app.config['DECRYPTED_FOLDER'], decrypted_filename)

    with open(decrypted_path, 'wb') as f:
        f.write(decrypted_data)

    return send_file(decrypted_path, as_attachment=True)

# 📦 Analyze Endpoint (Used in Angular FileService)
@app.route('/analyze', methods=['POST'])
def analyze_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    filename = file.filename
    file_bytes = file.read()

    # Basic simulated analysis
    analysis = {
        'filename': filename,
        'size_bytes': len(file_bytes),
        'contains_malware': scan_for_malware(file_bytes)
    }

    return jsonify(analysis), 200

if __name__ == '__main__':
    app.run(debug=True)
