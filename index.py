from flask import Flask, render_template, redirect, url_for, request, make_response
import random
import sqlite3
import atexit



app = Flask(__name__)

adminpasscode = random.randint(1000, 9999)
print(f"The admin passcode is {adminpasscode}")
conn = sqlite3.connect("database.db", isolation_level=None, check_same_thread=False)
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_keys = ON;")

@app.route("/admin/checkpasscode", methods=['GET', 'POST'])
def checkpasscode():
    if request.mimetype == 'application/json' and (request.get_json().get('passcode') == str(adminpasscode) or request.get_json().get('passcode') == adminpasscode):
        return {"correctpasscode":True}
    else:
        print(f"The admin passcode is {adminpasscode}")
        return {"correctpasscode":False}

@app.route("/admin")
def admin():
    passcodeCoookie = request.cookies.get('passcode')

    if passcodeCoookie and (passcodeCoookie == str(adminpasscode) or passcodeCoookie == adminpasscode):
        data = {"products" : []}

        for product in cursor.execute("""SELECT * FROM product""").fetchall():
            productobject = {
                "id" : product[0],
                "name" : product[1],
                "type" : product[2],
                "description" : product[3],
                "extradata" : product[4],
                "variants" : [],
                "images" : [],
            }

            for variant in cursor.execute(f"""
                SELECT colour.id, colour.name, colour.hex, variant.price
                FROM variant
                INNER JOIN colour ON variant.colourid = colour.id
                WHERE productid = {product[0]}
                GROUP BY colour.hex
                """).fetchall():
                    sizetypes = ["M", "W", "U", "size"]

                    variantobject = {
                        "name" : variant[1],
                        "hex" : variant[2],
                        "price" : variant[3],
                        "M" : [],
                        "W" : [],
                        "U" : [],
                        "size" : [],
                    }

                    for sizegender in cursor.execute(f"""
                        SELECT variant.gender, variant.size
                        FROM variant
                        INNER JOIN colour ON variant.colourid = colour.id
                        WHERE variant.colourid = {variant[0]}
                        """).fetchall():
                            if sizegender[0] in sizetypes:
                                variantobject[sizegender[0]].append(int(sizegender[1]))


                    for type in sizetypes:
                        if not variantobject[type]:
                            variantobject.pop(type, None)

                    productobject["variants"].append(variantobject)

            for image in cursor.execute(f"""
                SELECT "file"
                FROM productimage
                WHERE productid = {product[0]}
                """).fetchall():
                    productobject["images"].append(image[0])

            data["products"].append(productobject)

        print(data)

        return render_template("admin/dashboard.html", logedin=True, data=data)
    else:
        response = make_response(render_template("admin/login.html", logedin=False), 200)
        response.set_cookie('passcode', '', expires=0)
        return response

@atexit.register
def closeConnectionBeforeExit():
    conn.close()


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
