import importlib,os,unittest,uuid
from pymongo import MongoClient
module=importlib.import_module(os.environ.get('LAB_MODULE','starter'))
class Tests(unittest.TestCase):
    def setUp(self):
        self.client=MongoClient(os.environ.get('MONGO_URI','mongodb://127.0.0.1:27017'),serverSelectionTimeoutMS=3000);self.client.admin.command('ping')
        self.name='practical_test_'+uuid.uuid4().hex;self.col=self.client[self.name].reports;self.app=module.create_app(self.col);self.app.testing=True;self.c=self.app.test_client()
    def tearDown(self):self.client.drop_database(self.name);self.client.close()
    def test_workflow(self):
        for title in ['Notebook','Textbook']:self.assertEqual(self.c.post('/',data=dict(title=title,day='2026-02-28',category='Books')).status_code,302)
        self.assertEqual(self.col.count_documents({}),2)
        self.assertIn(b'Notebook',self.c.get('/?day=2026-02-28&category=Books').data)
        self.assertIn(b'No reports',self.c.get('/?category=Clothing').data)
        key=self.col.find_one({})['report_id'];self.assertEqual(self.c.post('/claim/'+key).status_code,302)
        self.assertEqual(self.col.count_documents({'claimed':True}),1)
        self.assertEqual(self.c.post('/claim/absent').status_code,404)
    def test_calendar_validation(self):
        for day in ['2026-02-30','2026/02/28','20260228','']:
            self.assertEqual(self.c.post('/',data=dict(title='X',day=day,category='Books')).status_code,400)
        self.assertEqual(self.col.count_documents({}),0)
if __name__=='__main__':unittest.main()
