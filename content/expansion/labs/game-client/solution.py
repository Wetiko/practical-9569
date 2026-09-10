import json,socket

def play(connection,moves):
    moves=iter(moves)
    with connection.makefile('rwb') as stream:
        while True:
            raw=stream.readline(4097)
            if not raw or not raw.endswith(b'\n') or len(raw)>4096:
                raise ConnectionError('Game ended without a complete result')
            message=json.loads(raw)
            if message['type']=='done':
                return message['result']
            if message['type']=='info':
                continue
            if message['type'] not in ['turn','retry']:
                raise ValueError('Unknown message type')
            try:
                row,col=next(moves)
            except StopIteration:
                raise ValueError('No moves remaining')
            stream.write((json.dumps({'row':row,'col':col})+'\n').encode())
            stream.flush()

if __name__=='__main__':
    with socket.create_connection(('127.0.0.1',5056),timeout=3) as connection:
        print(play(connection,[(7,7),(0,0),(1,1)]))
