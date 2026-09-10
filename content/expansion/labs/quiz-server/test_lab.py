import importlib,os,unittest,socket,threading,json
from client import play
module=importlib.import_module(os.environ.get('LAB_MODULE','starter'))
class Tests(unittest.TestCase):
    def test_multiple_clients_and_disconnect(self):
        with socket.socket() as listener:
            listener.bind(('127.0.0.1',0));listener.listen();listener.settimeout(5)
            port=listener.getsockname()[1];errors=[]
            def run():
                try:module.serve(listener,max_clients=3)
                except Exception as e:errors.append(e)
            thread=threading.Thread(target=run,daemon=True);thread.start()
            with socket.create_connection(('127.0.0.1',port),timeout=3) as connection:
                connection.sendall(b'{"user');connection.sendall(b'name":"First"}\n{"answer":"B"}\n{"answer":"A"}\n')
                stream=connection.makefile('rb');rows=[json.loads(stream.readline()) for _ in range(3)];stream.close()
                self.assertEqual(rows[-1]['score'],2)
            with socket.create_connection(('127.0.0.1',port),timeout=3) as connection:connection.sendall(b'{"username":')
            result=play('127.0.0.1',port,'Second',['A','B']);self.assertEqual(result['score'],0);self.assertEqual(result['username'],'Second')
            thread.join(5);self.assertFalse(thread.is_alive());self.assertEqual(errors,[])
if __name__=='__main__':unittest.main()
