from flask import Blueprint
from flask import render_template



miscRoutes = Blueprint("misc", __name__)



@miscRoutes.route("/")
def home():
    return render_template("home.html", active_page="home")



@miscRoutes.route("/Impressum")
def impressum():
    return render_template ("impressum.html", active_page="impressum")



@miscRoutes.route("/Dateschutz")
def datenschutz():
    return render_template ("datenschutz.html", active_page="datenschutz")
