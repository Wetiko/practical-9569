from pathlib import Path
from uuid import uuid4
import sqlite3
from PIL import Image, UnidentifiedImageError
from flask import Flask,request,redirect,render_template,send_from_directory

def create_app(database='photos.db',upload_dir='uploads'):
    app=Flask(__name__);app.config['MAX_CONTENT_LENGTH']=2*1024*1024
    folder=Path(upload_dir).resolve();folder.mkdir(parents=True,exist_ok=True)
    with sqlite3.connect(database) as conn:
        conn.execute('CREATE TABLE IF NOT EXISTS Photo(id INTEGER PRIMARY KEY,title TEXT NOT NULL,filename TEXT UNIQUE NOT NULL)')
    @app.route('/',methods=['GET','POST'])
    def index():
        if request.method=='POST':
            title=request.form.get('title','').strip();file=request.files.get('photo')
            if not title or not file or not file.filename:
                return 'Title and image required',400
            try:
                image=Image.open(file.stream)
                format=image.format
                if format not in ['PNG','JPEG']:
                    raise ValueError()
                image.verify();file.stream.seek(0)
            except (UnidentifiedImageError,OSError,ValueError):
                return 'Use a valid PNG or JPEG',400
            filename=uuid4().hex+('.png' if format=='PNG' else '.jpg')
            path=folder/filename
            try:
                file.save(path)
                with sqlite3.connect(database) as conn:
                    conn.execute('INSERT INTO Photo(title,filename) VALUES(?,?)',(title,filename))
            except Exception:
                path.unlink(missing_ok=True)
                raise
            return redirect('/')
        with sqlite3.connect(database) as conn:
            photos=conn.execute('SELECT title,filename FROM Photo ORDER BY id').fetchall()
        return render_template('index.html',photos=photos)
    @app.get('/photos/<path:name>')
    def photo(name):
        return send_from_directory(folder,name)
    return app

if __name__=='__main__':create_app().run(host='127.0.0.1',port=5052)
