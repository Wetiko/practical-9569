import importlib,os,unittest,socket,threading,json
from server import handle
module=importlib.import_module(os.environ.get('LAB_MODULE','starter'))
class Tests(unittest.TestCase):
    def test_given_server(self):
        a,b=socket.socketpair();a.settimeout(3);b.settimeout(3)
        with a,b:
            t=threading.Thread(target=handle,args=(b,),daemon=True);t.start()
            self.assertEqual(module.play(a,[(9,9),(0,0),(1,1)]),'win');t.join(3);self.assertFalse(t.is_alive())
    def test_fragmented_coalesced_messages(self):
        a,b=socket.socketpair();a.settimeout(3);b.settimeout(3)
        def peer():
            with b:
                b.sendall(b'{"type":"in');b.sendall(b'fo"}\n{"type":"turn"}\n')
                with b.makefile('rb') as stream:json.loads(stream.readline())
                b.sendall(b'{"type":"done","result":"win"}\n')
        with a:
            t=threading.Thread(target=peer,daemon=True);t.start();self.assertEqual(module.play(a,[(1,1)]),'win');t.join(3)
    def test_disconnect(self):
        a,b=socket.socketpair();b.close()
        with a:
            with self.assertRaises(ConnectionError):module.play(a,[])
if __name__=='__main__':unittest.main()
