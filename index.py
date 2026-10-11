import re

from flask import Flask, render_template, redirect, url_for, request, make_response
import random
import sqlite3
import atexit
import uuid
from PIL import Image




app = Flask(__name__)

adminpasscode = random.randint(1000, 9999)
print(f"The admin passcode is {adminpasscode}")
conn = sqlite3.connect("database.db", isolation_level=None, check_same_thread=False)
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_keys = ON;")


@atexit.register
def closeConnectionBeforeExit():
    conn.close()

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
        data = {"products" : [], "colours" : []}

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

        for colour in cursor.execute("""SELECT * FROM colour""").fetchall():
            colourobject = {
                "id" : colour[0],
                "name" : colour[1],
                "hex" : colour[2],
            }

            data["colours"].append(colourobject)


        return render_template("admin/dashboard.html", logedin=True, data=data)
    else:
        response = make_response(render_template("admin/login.html", logedin=False), 200)
        response.set_cookie('passcode', '', expires=0)
        return response


@app.route("/admin/colours/<action>", methods=['GET', 'POST'])
@app.route("/admin/colours/<action>/<int:id>", methods=['GET', 'POST'])
def colours(action, id=None):
    if request.args.get('uienabled') == 'false':
        uitemplate = "admin/nouibase.html"
    else:
        uitemplate = "admin/base.html"

    passcodeCoookie = request.cookies.get('passcode')

    supportedactions = ["edit", "delete", "new"]
    neededid= ["edit", "delete"]

    if passcodeCoookie and (passcodeCoookie == str(adminpasscode) or passcodeCoookie == adminpasscode):
        if action in supportedactions:
            if (action in neededid and id) or (action not in neededid):
                if request.method == 'POST':
                    if action == "new":
                        name = request.form.get('colourName')
                        hex = request.form.get('colourHex')

                        if name and hex:
                            try:
                                cursor.execute(f"""
                                    INSERT INTO colour ("name", "hex")
                                    VALUES ("{name}", "{hex}");
                                    """)
                            except sqlite3.Error as e:
                                return render_template("admin/error.html", logedin=True, error=f"When trying to add your color, SQLite threw this error: {e}")

                            return redirect(url_for('admin', _anchor=f""":~:text={hex}"""))
                        else:
                            return render_template("admin/error.html", logedin=True, error="You did not provide values for name or hex.")

                    if action == "delete":
                        sure = request.form.get('sure')

                        if sure != "iamsure":
                            return render_template("admin/error.html", logedin=True, error="Your were not sure, try again")


                        try:
                            cursor.execute(f"""
                                DELETE FROM colour WHERE id = {id}
                                """)
                        except sqlite3.Error as e:
                            return render_template("admin/error.html", logedin=True, error=f"When trying to delete your color, SQLite threw this error: {e}")

                        return redirect(url_for('admin'))

                    if action == "edit":
                        name = request.form.get('colourName')
                        hex = request.form.get('colourHex')

                        if name and hex:
                            try:
                                cursor.execute(f"""
                                    UPDATE colour
                                    SET hex = "{hex}", name = "{name}"
                                    WHERE id = {id};
                                    """)
                            except sqlite3.Error as e:
                                return render_template("admin/error.html", logedin=True, error=f"When trying to update your color, SQLite threw this error: {e}")

                            return redirect(url_for('admin', _anchor=f""":~:text={hex}"""))
                        else:
                            return render_template("admin/error.html", logedin=True, error="You did not provide values for name or hex.")




                if request.method == 'GET':
                    if  action == "new":
                        return render_template("admin/colours.html", uitemplate=uitemplate, logedin=True, action=action, id=id)
                    if  action == "delete":
                        try:
                            colourdata = cursor.execute(f"""
                                SELECT * FROM colour WHERE id = {id}
                                """).fetchall()
                        except sqlite3.Error as e:
                            return render_template("admin/error.html", logedin=True, error=f"When trying to find your color to delete, SQLite threw this error: {e}")

                        return render_template("admin/colours.html", uitemplate=uitemplate, logedin=True, action=action, id=colourdata[0][0], name=colourdata[0][1], hex=colourdata[0][2])
                    if  action == "edit":
                        try:
                            colourdata = cursor.execute(f"""
                                SELECT * FROM colour WHERE id = {id}
                                """).fetchall()
                        except sqlite3.Error as e:
                            return render_template("admin/error.html", logedin=True, error=f"When trying to find your color to edit, SQLite threw this error: {e}")

                        try:
                            return render_template("admin/colours.html", uitemplate=uitemplate, logedin=True, action=action, id=colourdata[0][0], name=colourdata[0][1], hex=colourdata[0][2])
                        except IndexError as e:
                             return render_template("admin/error.html", logedin=True, error="SQLite couldn't find your color.")





            else:
                return render_template("admin/error.html", logedin=True, error=f"That action for colour manipulation needs an ID. e.g. /admin/colours/{action}/1")

        else:
            return render_template("admin/error.html", logedin=True, error="That action for colour manipulation is not supported.")



    else:
        response = make_response(render_template("admin/login.html", logedin=False), 200)
        response.set_cookie('passcode', '', expires=0)
        return response

@app.route("/admin/product/<action>", methods=['GET', 'POST'])
@app.route("/admin/product/<action>/<int:id>", methods=['GET', 'POST'])
def products(action, id=None):

    data = {"products" : [], "colours" : [], "sports" : [], "vibes" : [], "categories" : []}

    for colour in cursor.execute("""SELECT * FROM colour""").fetchall():
        colourobject = {
            "id" : colour[0],
            "name" : colour[1],
            "hex" : colour[2],
        }

        data["colours"].append(colourobject)


    for sport in cursor.execute("""SELECT id, name, icon FROM sport""").fetchall():
        sportobject = {
            "id" : sport[0],
            "name" : sport[1],
            "icon" : sport[2],
        }

        data["sports"].append(sportobject)

    for vibe in cursor.execute("""SELECT id, name, icon FROM vibe""").fetchall():
        vibeobject = {
            "id" : vibe[0],
            "name" : vibe[1],
            "icon" : vibe[2],
        }

        data["vibes"].append(vibeobject)

    for category in cursor.execute("""SELECT id, name, icon FROM category""").fetchall():
        categoryobject = {
            "id" : category[0],
            "name" : category[1],
            "icon" : category[2],
        }

        data["categories"].append(categoryobject)

    if request.args.get('uienabled') == 'false':
        uitemplate = "admin/nouibase.html"
    else:
        uitemplate = "admin/base.html"

    passcodeCoookie = request.cookies.get('passcode')

    supportedactions = ["edit", "delete", "new"]
    neededid= ["edit", "delete"]

    if passcodeCoookie and (passcodeCoookie == str(adminpasscode) or passcodeCoookie == adminpasscode):
        if action in supportedactions:
            if (action in neededid and id) or (action not in neededid):
                if request.method == 'POST':
                    if action == "new":
                        name = request.form.get('colourName')
                        hex = request.form.get('colourHex')

                        if name and hex:
                            try:
                                cursor.execute(f"""
                                    INSERT INTO colour ("name", "hex")
                                    VALUES ("{name}", "{hex}");
                                    """)
                            except sqlite3.Error as e:
                                return render_template("admin/error.html", logedin=True, error=f"When trying to add your color, SQLite threw this error: {e}")

                            return redirect(url_for('admin', _anchor=f""":~:text={hex}"""))
                        else:
                            return render_template("admin/error.html", logedin=True, error="You did not provide values for name or hex.")

                    if action == "delete":
                        sure = request.form.get('sure')

                        if sure != "iamsure":
                            return render_template("admin/error.html", logedin=True, error="Your were not sure, try again")


                        try:
                            cursor.execute(f"""
                                DELETE FROM colour WHERE id = {id}
                                """)
                        except sqlite3.Error as e:
                            return render_template("admin/error.html", logedin=True, error=f"When trying to delete your color, SQLite threw this error: {e}")

                        return redirect(url_for('admin'))

                    if action == "edit":
                        name = request.form.get('colourName')
                        hex = request.form.get('colourHex')

                        if name and hex:
                            try:
                                cursor.execute(f"""
                                    UPDATE colour
                                    SET hex = "{hex}", name = "{name}"
                                    WHERE id = {id};
                                    """)
                            except sqlite3.Error as e:
                                return render_template("admin/error.html", logedin=True, error=f"When trying to update your color, SQLite threw this error: {e}")

                            return redirect(url_for('admin', _anchor=f""":~:text={hex}"""))
                        else:
                            return render_template("admin/error.html", logedin=True, error="You did not provide values for name or hex.")




                if request.method == 'GET':
                    if  action == "new":
                        return render_template("admin/products.html", data=data, uitemplate=uitemplate, logedin=True, action=action, id=id)
                    if  action == "delete":
                        try:
                            colourdata = cursor.execute(f"""
                                SELECT * FROM colour WHERE id = {id}
                                """).fetchall()
                        except sqlite3.Error as e:
                            return render_template("admin/error.html", logedin=True, error=f"When trying to find your color to delete, SQLite threw this error: {e}")

                        return render_template("admin/products.html", uitemplate=uitemplate, logedin=True, action=action, id=colourdata[0][0], name=colourdata[0][1], hex=colourdata[0][2])
                    if  action == "edit":
                        try:
                            colourdata = cursor.execute(f"""
                                SELECT * FROM colour WHERE id = {id}
                                """).fetchall()
                        except sqlite3.Error as e:
                            return render_template("admin/error.html", logedin=True, error=f"When trying to find your color to edit, SQLite threw this error: {e}")

                        try:
                            return render_template("admin/products.html", uitemplate=uitemplate, logedin=True, action=action, id=colourdata[0][0], name=colourdata[0][1], hex=colourdata[0][2])
                        except IndexError:
                             return render_template("admin/error.html", logedin=True, error="SQLite couldn't find your color.")
                        except Exception as e:
                            return render_template("admin/error.html", logedin=True, error=e)





            else:
                return render_template("admin/error.html", logedin=True, error=f"That action for colour manipulation needs an ID. e.g. /admin/colours/{action}/1")

        else:
            return render_template("admin/error.html", logedin=True, error="That action for colour manipulation is not supported.")



    else:
        response = make_response(render_template("admin/login.html", logedin=False), 200)
        response.set_cookie('passcode', '', expires=0)
        return response



@app.route("/admin/uploadimage", methods=['GET', 'POST'])
def uploadimage():

    passcodeCoookie = request.cookies.get('passcode')

    if passcodeCoookie and (passcodeCoookie == str(adminpasscode) or passcodeCoookie == adminpasscode):
        if request.args.get('uienabled') == 'false':
            uitemplate = "admin/nouibase.html"
        else:
            uitemplate = "admin/base.html"

        if request.method == 'GET':
            return render_template("admin/uploadimage.html", uitemplate=uitemplate, logedin=True)

        if request.method == 'POST':
            try:
                imageUpload = request.files.get('image')
                if imageUpload:
                    image = Image.open(imageUpload)
                    uniqueIdentifier = str(uuid.uuid4())
                    imageFilename = f"photos/{uniqueIdentifier}.png"
                    image.save(f"static/photos/{uniqueIdentifier}.png", "PNG")
                    return redirect(url_for('static', filename=imageFilename))
                else:
                    return render_template("admin/error.html", logedin=True, error="No image uploaded")
            except Exception as e:
                return render_template("admin/error.html", logedin=True, error=e)
    else:
        response = make_response(render_template("admin/login.html", logedin=False), 200)
        response.set_cookie('passcode', '', expires=0)
        return response




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
