import json,socket

class Question:
    def __init__(self,text,answer):
        self.text,self._answer=text,answer
    def correct(self,answer):
        return answer.strip().upper()==self._answer
class QuizSession:
    def __init__(self,username):
        self.username,self.score=username,0
    def record(self,question,answer):
        self.score+=int(question.correct(answer))
QUESTIONS=[Question('2 + 3? A: 4, B: 5','B'),Question('FIFO structure? A: queue, B: stack','A')]

def handle(connection):
    connection.settimeout(3)
    with connection.makefile('rwb') as stream:
        def send(message):
            stream.write((json.dumps(message)+'\n').encode());stream.flush()
        def receive():
            raw=stream.readline(4097)
            if not raw or not raw.endswith(b'\n') or len(raw)>4096:
                raise ConnectionError('Incomplete or oversized message')
            return json.loads(raw)
        hello=receive()
        if not isinstance(hello,dict) or not isinstance(hello.get('username'),str) or not hello['username'].strip():
            raise ValueError('Username required')
        session=QuizSession(hello['username'].strip())
        for index,question in enumerate(QUESTIONS,1):
            send({'type':'question','number':index,'text':question.text})
            answer=receive()
            if not isinstance(answer,dict) or not isinstance(answer.get('answer'),str):
                raise ValueError('Answer required')
            session.record(question,answer['answer'])
        send({'type':'result','username':session.username,'score':session.score})

def serve(listener,max_clients=None):
    handled=0
    while max_clients is None or handled<max_clients:
        connection,_=listener.accept()
        with connection:
            try:
                handle(connection)
            except (OSError,ConnectionError,ValueError,TypeError):
                pass
        handled+=1

if __name__=='__main__':
    with socket.socket() as listener:
        listener.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
        listener.bind(('127.0.0.1',5055));listener.listen()
        serve(listener)
