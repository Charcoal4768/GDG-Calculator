from flask import Flask, render_template

from calculator_app.api import api


def create_app():
    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )

    @app.get("/")
    def index():
        return render_template("index.html")

    app.register_blueprint(api)
    return app
