from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Modelos de la Base de Datos (mapeo de las tablas SQL a clases de Python)

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)

class Address(db.Model):
    __tablename__ = 'addresses'
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    state_code = db.Column(db.String(10))
    postal_code = db.Column(db.String(20))
    lat = db.Column(db.Numeric(10, 7))
    lng = db.Column(db.Numeric(10, 7))
    country = db.Column(db.String(100))

class Company(db.Model):
    __tablename__ = 'companies'
    id = db.Column(db.Integer, primary_key=True)
    department = db.Column(db.String(100))
    name = db.Column(db.String(150))
    title = db.Column(db.String(100))
    address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'))
    address = db.relationship('Address')

class Bank(db.Model):
    __tablename__ = 'banks'
    id = db.Column(db.Integer, primary_key=True)
    card_expire = db.Column(db.String(10))
    card_number = db.Column(db.String(20))
    card_type = db.Column(db.String(50))
    currency = db.Column(db.String(10))
    iban = db.Column(db.String(50))

class Crypto(db.Model):
    __tablename__ = 'cryptos'
    id = db.Column(db.Integer, primary_key=True)
    coin = db.Column(db.String(50))
    wallet = db.Column(db.String(255))
    network = db.Column(db.String(100))

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    maiden_name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(50))
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    birth_date = db.Column(db.Date)
    image_url = db.Column(db.String(255))
    blood_group = db.Column(db.String(5))
    height = db.Column(db.Numeric(5, 2))
    weight = db.Column(db.Numeric(5, 2))
    eye_color = db.Column(db.String(50))
    hair_color = db.Column(db.String(50))
    hair_type = db.Column(db.String(50))
    ip = db.Column(db.String(45))
    mac_address = db.Column(db.String(17))
    university = db.Column(db.String(150))
    ein = db.Column(db.String(20))
    ssn = db.Column(db.String(20))
    user_agent = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'))
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'))
    bank_id = db.Column(db.Integer, db.ForeignKey('banks.id'))
    crypto_id = db.Column(db.Integer, db.ForeignKey('cryptos.id'))

    role = db.relationship('Role')
    address = db.relationship('Address')
    company = db.relationship('Company')
    bank = db.relationship('Bank')
    crypto = db.relationship('Crypto')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Style(db.Model):
    __tablename__ = 'styles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, default=False)
    primary_color = db.Column(db.String(7))
    secondary_color = db.Column(db.String(7))
    accent_color = db.Column(db.String(7))
    text_color = db.Column(db.String(7))
    extra_color_1 = db.Column(db.String(7))
    extra_color_2 = db.Column(db.String(7))
    font_family = db.Column(db.String(100))
    font_size_base = db.Column(db.Integer)