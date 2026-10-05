from flask import Flask, render_template, redirect, url_for, request

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html", username="Rafe")

@app.route("/base")
def base():
    return render_template("base.html")

@app.after_request
def add_custom_static_headers(response):
    if request.endpoint == 'static':
        response.headers['X-Custom-Header'] = 'MyCustomValue'
        response.headers['Access-Control-Allow-Origin'] = '*'

    return response




if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8888, debug=True)
