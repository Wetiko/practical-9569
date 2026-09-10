"""Given deterministic server. The hidden winning square is row 1, column 1."""
import json,socket

def handle(connection):
    with connection.makefile('rwb') as stream:
        def send(message):stream.write((json.dumps(message)+'\n').encode());stream.flush()
        send({'type':'info','text':'Find the marked square in a 2 by 2 board.'})
        send({'type':'turn'})
        while True:
            raw=stream.readline(4097)
            if not raw or len(raw)>4096:return
            message=json.loads(raw);row,col=message.get('row'),message.get('col')
            if type(row) is not int or type(col) is not int or row not in [0,1] or col not in [0,1]:
                send({'type':'retry','reason':'Coordinates must be 0 or 1'})
            elif (row,col)==(1,1):
                send({'type':'done','result':'win'});return
            else:send({'type':'turn','text':'Try another square'})
if __name__=='__main__':
    with socket.socket() as listener:
        listener.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);listener.bind(('127.0.0.1',5056));listener.listen()
        while True:
            connection,_=listener.accept()
            with connection:
                try:handle(connection)
                except (OSError,ValueError):pass
