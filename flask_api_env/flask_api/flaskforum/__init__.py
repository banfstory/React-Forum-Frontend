from flask import Flask
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS


app = Flask(__name__)
# security for forms
app.config['SECRET_KEY'] = '126d247fac6838979f70c076d0b056c8'
# create database file
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
# app.config['SQLALCHEMY_ECHO'] = True # display all sql statements been made

db = SQLAlchemy(app)
ma = Marshmallow(app)
bcrypt = Bcrypt(app)
CORS(app)
cors = CORS(app, resources={"/api/*": {"origins": "*"}}) # ensures that api can be accessed through localhost
login_manager = LoginManager(app)
migrate = Migrate(app, db)
manager = Manager(app)
manager.add_command('db', MigrateCommand)

from flaskforum.api.routes import api
app.register_blueprint(api)
