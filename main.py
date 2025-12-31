from flask import Flask, render_template, redirect, request
from routes.archive import archiveRoutes
from routes.forecast import forecastRoutes
from routes.misc import miscRoutes
from backend.getGEO import geocode



def page_not_found(e):
    return render_template("404.html"), 404

def weatherApp():
    app = Flask(__name__)
    @app.before_request
    def lowercase_redirect():
        path = request.path
        if path != path.lower() and not path.startswith('/static'):
            return redirect(path.lower(), code=301)
    app.register_blueprint(archiveRoutes)
    app.register_blueprint(forecastRoutes)
    app.register_blueprint(miscRoutes)
    geocode(app)
    app.register_error_handler(404, page_not_found)

    return app



app = weatherApp()
if __name__ == "__main__":
    app.run(debug=True)
    #app.run(host='0.0.0.0', port=5000, debug=True)
