import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'tu-super-secreto-string'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:jJUNIOR*27@localhost/inmotunerdb'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'otro-secreto-jwt'