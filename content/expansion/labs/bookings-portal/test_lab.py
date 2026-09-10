import importlib,os,tempfile,sqlite3,unittest
module=importlib.import_module(os.environ.get('LAB_MODULE','starter'))
class Tests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.db=self.tmp.name+'/test.db';self.app=module.create_app(self.db);self.app.testing=True;self.client=self.app.test_client()
    def tearDown(self):self.tmp.cleanup()
    def test_workflow(self):
        self.assertIn(b'No bookings found',self.client.get('/').data)
        self.assertEqual(self.client.post('/',data=dict(customer=1,event=1,quantity=2)).status_code,302)
        self.assertIn(b'Robotics',self.client.get('/?category=Tech').data)
        self.assertIn(b'No bookings found',self.client.get('/?category=Art').data)
        self.assertIn(b'No bookings found',self.client.get('/?category=%27%20OR%201=1--').data)
        self.assertEqual(self.client.get('/?day=2026-02-30').status_code,400)
        other=module.create_app(self.db).test_client();self.assertIn(b'Robotics',other.get('/').data)
    def test_invalid_writes(self):
        for row in [dict(customer=1,event=1,quantity=0),dict(customer=99,event=1,quantity=1),dict(customer='x',event=1,quantity=1)]:self.assertEqual(self.client.post('/',data=row).status_code,400)
        with sqlite3.connect(self.db) as c:self.assertEqual(c.execute('SELECT COUNT(*) FROM Booking').fetchone()[0],0)
        row=dict(customer=1,event=1,quantity=1);self.client.post('/',data=row);self.assertEqual(self.client.post('/',data=row).status_code,400)
if __name__=='__main__':unittest.main()
