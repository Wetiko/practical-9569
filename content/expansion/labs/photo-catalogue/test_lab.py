import importlib,os,tempfile,sqlite3,unittest,io
from pathlib import Path
from PIL import Image
module=importlib.import_module(os.environ.get('LAB_MODULE','starter'))
def png():
    stream=io.BytesIO();Image.new('RGB',(2,2),'blue').save(stream,format='PNG');stream.seek(0);return stream
class Tests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.db=self.tmp.name+'/db';self.folder=Path(self.tmp.name)/'images';self.app=module.create_app(self.db,str(self.folder));self.app.testing=True;self.c=self.app.test_client()
    def tearDown(self):self.tmp.cleanup()
    def test_upload_and_serve(self):
        for _ in range(2):self.assertEqual(self.c.post('/',data={'title':'Blue','photo':(png(),'../../same.png')}).status_code,302)
        names=[p.name for p in self.folder.iterdir()];self.assertEqual(len(set(names)),2)
        for name in names:self.assertEqual(self.c.get('/photos/'+name).status_code,200)
        self.assertIn(b'Blue',self.c.get('/').data);self.assertEqual(self.c.get('/photos/missing.png').status_code,404)
    def test_invalid_and_cleanup(self):
        for data in [{'title':'','photo':(png(),'x.png')},{'title':'X','photo':(io.BytesIO(b'not an image'),'x.png')},{'title':'X'}]:self.assertEqual(self.c.post('/',data=data).status_code,400)
        self.assertEqual(list(self.folder.iterdir()),[])
        with sqlite3.connect(self.db) as c:c.execute("CREATE TRIGGER fail BEFORE INSERT ON Photo BEGIN SELECT RAISE(ABORT,'failure'); END")
        with self.assertRaises(sqlite3.IntegrityError):self.c.post('/',data={'title':'X','photo':(png(),'x.png')})
        self.assertEqual(list(self.folder.iterdir()),[])
if __name__=='__main__':unittest.main()
