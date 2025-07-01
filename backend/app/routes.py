from flask import Blueprint, request, jsonify
from .models import db, User, Style, Role, Address, Company, Bank, Crypto
from datetime import datetime
import traceback # Import traceback for detailed error logging

api = Blueprint('api', __name__)

# --- Funciones Auxiliares ---

def calculate_age(birth_date):
    if not birth_date:
        return None
    today = datetime.utcnow()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

def format_user_to_json(user):
    if not user:
        return None
    
    # Calcular edad dinámicamente
    age = calculate_age(user.birth_date)

    # Formatear la fecha de nacimiento
    birth_date_str = user.birth_date.strftime('%Y-%m-%d') if user.birth_date else None

    # Construir el JSON de la dirección de la compañía si existe
    company_address_json = None
    if user.company and user.company.address:
        company_address_json = {
            "address": user.company.address.address,
            "city": user.company.address.city,
            "state": user.company.address.state,
            "stateCode": user.company.address.state_code,
            "postalCode": user.company.address.postal_code,
            "coordinates": {
                "lat": float(user.company.address.lat) if user.company.address.lat else None,
                "lng": float(user.company.address.lng) if user.company.address.lng else None
            },
            "country": user.company.address.country
        }

    return {
        "id": user.id,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "maidenName": user.maiden_name,
        "age": age, # Edad calculada
        "gender": user.gender,
        "email": user.email,
        "phone": user.phone,
        "username": user.username,
        "birthDate": birth_date_str,
        "image": user.image_url,
        "bloodGroup": user.blood_group,
        "height": float(user.height) if user.height else None,
        "weight": float(user.weight) if user.weight else None,
        "eyeColor": user.eye_color,
        "hair": {
            "color": user.hair_color,
            "type": user.hair_type
        },
        "ip": user.ip,
        "address": {
            "address": user.address.address,
            "city": user.address.city,
            "state": user.address.state,
            "stateCode": user.address.state_code,
            "postalCode": user.address.postal_code,
            "coordinates": {
                "lat": float(user.address.lat) if user.address.lat else None,
                "lng": float(user.address.lng) if user.address.lng else None
            },
            "country": user.address.country
        } if user.address else None,
        "macAddress": user.mac_address,
        "university": user.university,
        "bank": {
            "cardExpire": user.bank.card_expire,
            "cardNumber": user.bank.card_number,
            "cardType": user.bank.card_type,
            "currency": user.bank.currency,
            "iban": user.bank.iban
        } if user.bank else None,
        "company": {
            "department": user.company.department,
            "name": user.company.name,
            "title": user.company.title,
            "address": company_address_json
        } if user.company else None,
        "ein": user.ein,
        "ssn": user.ssn,
        "userAgent": user.user_agent,
        "crypto": {
            "coin": user.crypto.coin,
            "wallet": user.crypto.wallet,
            "network": user.crypto.network
        } if user.crypto else None,
        "role": user.role.name if user.role else None,
        "isActive": user.is_active
    }

# --- Rutas de Usuarios (Wizard) ---

@api.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        return jsonify([format_user_to_json(user) for user in users])
    except Exception as e:
        print(f"Error getting users: {e}")
        return jsonify({"msg": "Error fetching users"}), 500

@api.route('/users', methods=['POST'])
def create_user():
    print("--- CREATE USER ENDPOINT HIT ---")
    try:
        data = request.get_json()
        if not data:
            print("ERROR: No input data provided")
            return jsonify({"msg": "No input data provided"}), 400

        print("--- RAW DATA RECEIVED ---")
        # Using pprint for cleaner dictionary printing
        from pprint import pprint
        pprint(data)
        print("-------------------------")

        # --- Data Validation ---
        required_keys = ['username', 'email', 'password', 'first_name', 'last_name']
        missing_keys = [key for key in required_keys if key not in data or not data[key]]
        if missing_keys:
            error_msg = f"Missing essential user data: {', '.join(missing_keys)}"
            print(f"VALIDATION ERROR: {error_msg}")
            return jsonify({"msg": error_msg}), 400

        if User.query.filter_by(username=data['username']).first():
            print(f"VALIDATION ERROR: Username '{data['username']}' already exists.")
            return jsonify({"msg": "Username already exists"}), 400
        if User.query.filter_by(email=data['email']).first():
            print(f"VALIDATION ERROR: Email '{data['email']}' already exists.")
            return jsonify({"msg": f"Email '{data['email']}' already exists"}), 409

        # Iniciar transacción
        with db.session.begin_nested():
            print("--- Starting DB Transaction ---")
            
            # 1. Crear entidades relacionadas (si existen datos)
            
            # Dirección personal
            user_address_data = data.get('address')
            new_user_address = None
            if user_address_data:
                print("--- Processing User Address ---")
                pprint(user_address_data)
                new_user_address = Address(
                    address=user_address_data.get('address'),
                    city=user_address_data.get('city'),
                    state=user_address_data.get('state'),
                    state_code=user_address_data.get('state_code'),
                    postal_code=user_address_data.get('postal_code'),
                    country=user_address_data.get('country'),
                    lat=user_address_data.get('lat'),
                    lng=user_address_data.get('lng')
                )
                db.session.add(new_user_address)
                print("User Address object created.")

            # Compañía y su dirección
            company_data = data.get('company')
            new_company = None
            if company_data and company_data.get('name'):
                print("--- Processing Company ---")
                pprint(company_data)
                company_address_data = company_data.get('address')
                new_company_address = None
                if company_address_data:
                    print("--- Processing Company Address ---")
                    pprint(company_address_data)
                    new_company_address = Address(
                        address=company_address_data.get('address'),
                        city=company_address_data.get('city'),
                        state=company_address_data.get('state'),
                        state_code=company_address_data.get('state_code'),
                        postal_code=company_address_data.get('postal_code'),
                        country=company_address_data.get('country'),
                        lat=company_address_data.get('lat'),
                        lng=company_address_data.get('lng')
                    )
                    db.session.add(new_company_address)
                    print("Company Address object created.")
                
                new_company = Company(
                    name=company_data.get('name'),
                    department=company_data.get('department'),
                    title=company_data.get('title'),
                    address=new_company_address
                )
                db.session.add(new_company)
                print("Company object created.")

            # Banco
            bank_data = data.get('bank')
            new_bank = None
            if bank_data and bank_data.get('card_number'):
                print("--- Processing Bank ---")
                pprint(bank_data)
                new_bank = Bank(
                    card_expire=bank_data.get('card_expire'),
                    card_number=bank_data.get('card_number'),
                    card_type=bank_data.get('card_type'),
                    currency=bank_data.get('currency'),
                    iban=bank_data.get('iban')
                )
                db.session.add(new_bank)
                print("Bank object created.")

            # Crypto
            crypto_data = data.get('crypto')
            new_crypto = None
            if crypto_data and crypto_data.get('wallet'):
                print("--- Processing Crypto ---")
                pprint(crypto_data)
                new_crypto = Crypto(
                    coin=crypto_data.get('coin'),
                    wallet=crypto_data.get('wallet'),
                    network=crypto_data.get('network')
                )
                db.session.add(new_crypto)
                print("Crypto object created.")

            # Forzar la asignación de IDs a las nuevas entidades
            print("--- Flushing session to get IDs ---")
            db.session.flush()
            print("Session flushed.")
            if new_user_address: print(f"User Address ID: {new_user_address.id}")
            if new_company: print(f"Company ID: {new_company.id}")
            if new_bank: print(f"Bank ID: {new_bank.id}")
            if new_crypto: print(f"Crypto ID: {new_crypto.id}")

            # 2. Crear el usuario
            birth_date_str = data.get('birth_date')
            birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date() if birth_date_str else None
            
            print("--- Preparing User object ---")
            user_payload = {
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'maiden_name': data.get('maiden_name'),
                'gender': data.get('gender'),
                'email': data['email'],
                'phone': data.get('phone'),
                'username': data['username'],
                'birth_date': birth_date,
                'image_url': data.get('image_url'),
                'blood_group': data.get('blood_group'),
                'height': data.get('height'),
                'weight': data.get('weight'),
                'eye_color': data.get('eye_color'),
                'hair_color': data.get('hair_color'),
                'hair_type': data.get('hair_type'),
                'ip': data.get('ip'),
                'mac_address': data.get('mac_address'),
                'university': data.get('university'),
                'ein': data.get('ein'),
                'ssn': data.get('ssn'),
                'user_agent': data.get('user_agent'),
                'role_id': data.get('role_id', 2),
                'address_id': new_user_address.id if new_user_address else None,
                'company_id': new_company.id if new_company else None,
                'bank_id': new_bank.id if new_bank else None,
                'crypto_id': new_crypto.id if new_crypto else None
            }
            pprint(user_payload)

            new_user = User(**user_payload)
            new_user.set_password(data['password'])
            db.session.add(new_user)
            print("User object created and added to session.")

        # Commit de la transacción completa
        print("--- Committing transaction ---")
        db.session.commit()
        print("--- Transaction committed successfully! ---")
        
        # Devolver el usuario recién creado con todos sus datos
        return jsonify(format_user_to_json(new_user)), 201

    except Exception as e:
        print("---!!! AN ERROR OCCURRED !!!---")
        # Imprimir el stack trace completo para un debug detallado
        traceback.print_exc()
        print("---------------------------------")
        db.session.rollback()
        return jsonify({"msg": "An error occurred while creating the user.", "error": str(e)}), 500


@api.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(format_user_to_json(user))

@api.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({"msg": "User deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error deleting user", "error": str(e)}), 500

@api.route('/users/<int:user_id>/toggle_active', methods=['PUT'])
def toggle_user_active(user_id):
    try:
        user = User.query.get_or_404(user_id)
        user.is_active = not user.is_active
        db.session.commit()
        return jsonify({"msg": f"User {user.username} active state set to {user.is_active}"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error toggling user active state", "error": str(e)}), 500

# --- Rutas de Autenticación (Simplificadas) ---
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.check_password(data.get('password')):
        if not user.is_active:
            return jsonify({"msg": "El usuario está inactivo y no puede iniciar sesión."}), 403 # Forbidden
        # Ya no se crea un token, solo se devuelve el rol para que el frontend sepa si es admin
        return jsonify(role=user.role.name)
    return jsonify({"msg": "Bad username or password"}), 401


# --- Rutas de Estilos ---
@api.route('/styles', methods=['GET'])
def get_styles():
    styles = Style.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'isActive': s.is_active,
        'primaryColor': s.primary_color,
        'secondaryColor': s.secondary_color,
        'accentColor': s.accent_color,
        'textColor': s.text_color,
        'extraColor1': s.extra_color_1,
        'extraColor2': s.extra_color_2,
        'fontFamily': s.font_family,
        'fontSizeBase': s.font_size_base
    } for s in styles])

@api.route('/styles/active', methods=['GET'])
def get_active_style():
    style = Style.query.filter_by(is_active=True).first()
    if not style:
        return jsonify({"msg": "No active style found"}), 404
    return jsonify({
        'primaryColor': style.primary_color,
        'secondaryColor': style.secondary_color,
        'accentColor': style.accent_color,
        'textColor': style.text_color,
        'extraColor1': style.extra_color_1,
        'extraColor2': style.extra_color_2,
        'fontFamily': style.font_family,
        'fontSizeBase': f"{style.font_size_base}px"
    })

@api.route('/styles', methods=['POST'])
def create_style():
    # Se elimina la validación de rol
    # claims = get_jwt()
    # if claims.get('role') != 'admin':
    #     return jsonify({"msg": "Admins only"}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Request body is missing"}), 400

    # Mapeo manual de camelCase (JS) a snake_case (Python) con valores por defecto
    new_style = Style(
        name=data.get('name', 'Nuevo Estilo'),
        is_active=data.get('isActive', False),
        primary_color=data.get('primaryColor', '#000000'),
        secondary_color=data.get('secondaryColor', '#ffffff'),
        accent_color=data.get('accentColor', '#ff0000'),
        text_color=data.get('textColor', '#333333'),
        extra_color_1=data.get('extraColor1', '#cccccc'),
        extra_color_2=data.get('extraColor2', '#999999'),
        font_family=data.get('fontFamily', 'Arial, sans-serif'),
        font_size_base=data.get('fontSizeBase', 16)
    )
    
    db.session.add(new_style)
    db.session.commit()
    return jsonify({'id': new_style.id}), 201

@api.route('/styles/<int:style_id>', methods=['PUT', 'DELETE'])
def manage_style(style_id):
    # Se elimina la validación de rol
    # claims = get_jwt()
    # if claims.get('role') != 'admin':
    #     return jsonify({"msg": "Admins only"}), 403

    style = Style.query.get_or_404(style_id)

    if request.method == 'PUT':
        data = request.get_json()
        if not data:
            return jsonify({"msg": "Request body is missing"}), 400

        # Si se activa este estilo, desactiva los demás
        if data.get('isActive'):
            Style.query.filter(Style.id != style_id).update({Style.is_active: False})
        
        # Mapeo manual para la actualización
        style.name = data.get('name', style.name)
        style.is_active = data.get('isActive', style.is_active)
        style.primary_color = data.get('primaryColor', style.primary_color)
        style.secondary_color = data.get('secondaryColor', style.secondary_color)
        style.accent_color = data.get('accentColor', style.accent_color)
        style.text_color = data.get('textColor', style.text_color)
        style.extra_color_1 = data.get('extraColor1', style.extra_color_1)
        style.extra_color_2 = data.get('extraColor2', style.extra_color_2)
        style.font_family = data.get('fontFamily', style.font_family)
        style.font_size_base = data.get('fontSizeBase', style.font_size_base)
        
        db.session.commit()
        return jsonify({"msg": "Style updated"}), 200
    
    if request.method == 'DELETE':
        if style.is_active:
            return jsonify({"msg": "Cannot delete an active style. Please activate another style first."}), 400
            
        db.session.delete(style)
        db.session.commit()
        return jsonify({"msg": "Style deleted"}), 200