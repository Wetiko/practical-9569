"""Given client. Implement the compatible server in starter.py."""
import socket,json

def play(host,port,username,answers):
    with socket.create_connection((host,port),timeout=3) as connection,connection.makefile('rwb') as stream:
        stream.write((json.dumps({'username':username})+'\n').encode());stream.flush()
        answers=iter(answers)
        while True:
            raw=stream.readline()
            if not raw:raise ConnectionError('Server disconnected')
            message=json.loads(raw)
            if message['type']=='result':return message
            print(message['text'])
            stream.write((json.dumps({'answer':next(answers)})+'\n').encode());stream.flush()
if __name__=='__main__':print(play('127.0.0.1',5055,'Practice',['B','A']))
