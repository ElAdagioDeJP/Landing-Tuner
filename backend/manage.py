import click
from app import create_app, db
from app.models import User, Role
from flask_migrate import Migrate

# Crea una instancia de la aplicación para tener el contexto necesario
app = create_app()
migrate = Migrate(app, db)

# Mueve la aplicación al contexto para que db y otros funcionen
@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Role': Role}

@app.cli.command("create-admin")
@click.argument("email")
@click.argument("password")
def create_admin(email, password):
    """Crea un nuevo usuario administrador."""
    with app.app_context():
        # 1. Buscar o crear el rol de 'admin'
        admin_role = Role.query.filter_by(name='admin').first()
        if not admin_role:
            print("Rol 'admin' no encontrado, creándolo...")
            admin_role = Role(name='admin')
            db.session.add(admin_role)
            # Hacemos commit aquí para que el rol obtenga un ID
            db.session.commit()
            print("✔ Rol 'admin' creado.")

        # 2. Verificar si el usuario ya existe
        if User.query.filter_by(email=email).first():
            print(f"¡Error: El usuario con email '{email}' ya existe!")
            return

        # 3. Crear el nuevo usuario administrador
        admin_user = User(
            first_name="Admin",
            last_name="User",
            email=email,
            username=email.split('@')[0], # O un username que prefieras
            role_id=admin_role.id
        )
        admin_user.set_password(password) # Usamos el método del modelo

        db.session.add(admin_user)
        db.session.commit()
        print(f"✔ Usuario administrador creado con email: {email}")

