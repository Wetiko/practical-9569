from datetime import date
from uuid import uuid4
from flask import Flask,request,redirect,render_template,abort
from pymongo import MongoClient
import os

def create_app(collection=None):
    app=Flask(__name__)
    if collection is None:
        client=MongoClient(os.environ.get('MONGO_URI','mongodb://127.0.0.1:27017'),serverSelectionTimeoutMS=3000)
        client.admin.command('ping')
        collection=client['practical_lost_property']['reports']
    collection.create_index('report_id',unique=True)
    def valid_day(value):
        try:return date.fromisoformat(value).isoformat()==value
        except ValueError:return False
    @app.route('/',methods=['GET','POST'])
    def index():
        if request.method=='POST':
            title,day,category=[request.form.get(k,'').strip() for k in ['title','day','category']]
            if not title or not valid_day(day) or category not in ['Books','Clothing','Other']:
                return 'Invalid report',400
            collection.insert_one(dict(report_id=uuid4().hex,title=title,day=day,category=category,claimed=False))
            return redirect('/')
        query={}
        for key in ['day','category']:
            value=request.args.get(key,'')
            if value:query[key]=value
        if 'day' in query and not valid_day(query['day']):return 'Invalid date',400
        return render_template('index.html',rows=list(collection.find(query,{'_id':0}).sort([('day',1),('report_id',1)])))
    @app.post('/claim/<report_id>')
    def claim(report_id):
        result=collection.update_one({'report_id':report_id},{'$set':{'claimed':True}})
        if not result.matched_count:abort(404)
        return redirect('/')
    return app

if __name__=='__main__':create_app().run(host='127.0.0.1',port=5053)
