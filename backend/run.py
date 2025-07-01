from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Puedes usar esto para crear las tablas la primera vez
        # db.create_all() 
        pass
    app.run(debug=True)