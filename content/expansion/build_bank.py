"""Original expansion exercises. Run from the repository root."""
import json,textwrap
from pathlib import Path
ROOT=Path(__file__).parent
new=[]
def add(id,title,ref,description,solution,tests,*,topic='Python & files',level='Core',minutes=25,setup='',files=None,starter=None,rubric=None):
 solution=textwrap.dedent(solution).strip()+'\n';setup=textwrap.dedent(setup).strip()
 new.append(dict(id=id,title=title,topic=topic,level=level,minutes=minutes,ref=ref,description=description,solution=solution,starter=starter or solution.splitlines()[0]+'\n    pass\n',tests=[dict(label=l,expr=e,expected=v) for l,e,v in tests],hints=['Separate validation, state changes and output.','Try an empty case, an exact boundary and repeated operations.'],setup=setup,files=files or {},kind='python',rubric=rubric or [],source='Original syllabus expansion',sourceUrl=''))
add('booking-schema','Build a booking database','3.3.1–3.3.2 / 3.3.8',
'''Implement create_schema(conn) on an empty SQLite connection. Enable foreign keys. Create Customer(id INTEGER PRIMARY KEY, name TEXT NOT NULL), Event(id INTEGER PRIMARY KEY, title TEXT NOT NULL), and Booking(customer_id INTEGER, event_id INTEGER, quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 8)). Both IDs in Booking are NOT NULL foreign keys, and together form its primary key. Commit the schema; return None. Tests inspect constraints as well as valid inserts.''',
'''
def create_schema(conn):
    conn.execute('PRAGMA foreign_keys = ON')
    conn.executescript('''+ '"""'+'''
    CREATE TABLE Customer(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE Event(id INTEGER PRIMARY KEY, title TEXT NOT NULL);
    CREATE TABLE Booking(customer_id INTEGER NOT NULL REFERENCES Customer(id),
        event_id INTEGER NOT NULL REFERENCES Event(id),
        quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 8),
        PRIMARY KEY(customer_id, event_id));
    '''+'"""'+''')
    conn.commit()
''',[("Constraints","schema_check()",[1,True,True,True,True,True,True,True,True]),("Columns","schema_columns()",['customer_id','event_id','quantity'])],topic='Databases',minutes=30,
setup='''
import sqlite3
def fresh():
    c=sqlite3.connect(':memory:');create_schema(c)
    c.execute("INSERT INTO Customer VALUES(1,'Ari')");c.execute("INSERT INTO Event VALUES(1,'Robotics')")
    return c
def schema_check():
    c=fresh();c.execute('INSERT INTO Booking VALUES(1,1,1)')
    result=[c.execute('PRAGMA foreign_keys').fetchone()[0]]
    for values in [(1,1,2),(2,1,1),(1,2,1),(1,1,0),(None,1,1),(1,None,1),(1,1,9),(1,1,None)]:
        if values != (1,1,2):c.execute('DELETE FROM Booking')
        try:c.execute('INSERT INTO Booking VALUES(?,?,?)',values);result.append(False)
        except sqlite3.IntegrityError:result.append(True)
    return result
def schema_columns():
    c=fresh();return [r[1] for r in c.execute('PRAGMA table_info(Booking)')]
''',starter='def create_schema(conn):\n    pass\n')
add('register-import','Import an imperfect register','2.3.4 / 2.4.2 / 3.3.8',
'''Implement import_register(conn, path). Student(id INTEGER PRIMARY KEY, name TEXT NOT NULL, score INTEGER CHECK(score BETWEEN 0 AND 100)) already exists and the connection has no active transaction. Read a UTF-8 CSV with exact header id,name,score. Strip fields; IDs must be positive decimal integers, names nonempty, scores decimal integers 0–100. Skip invalid rows and duplicate IDs (first valid record wins, including existing database rows). Return [inserted_count, rejected_line_numbers], counting header as line 1. CSV names may contain commas but no embedded newlines. Reject a wrong header with ValueError. Any unexpected database error must roll back all inserts from this call and propagate. Do not modify the source file.''',
'''
import csv

def import_register(conn, path):
    count, rejected = 0, []
    with open(path, newline='', encoding='utf-8') as handle:
        rows = csv.reader(handle)
        if next(rows, None) != ['id', 'name', 'score']:
            raise ValueError('Invalid header')
        with conn:
            for line, row in enumerate(rows, 2):
                if len(row) != 3:
                    rejected.append(line)
                    continue
                key, name, score = [v.strip() for v in row]
                if not key.isascii() or not key.isdecimal() or int(key) < 1 or not name or not score.isascii() or not score.isdecimal() or not 0 <= int(score) <= 100:
                    rejected.append(line)
                    continue
                if conn.execute('SELECT 1 FROM Student WHERE id=?', (int(key),)).fetchone():
                    rejected.append(line)
                    continue
                conn.execute('INSERT INTO Student VALUES(?,?,?)', (int(key), name, int(score)))
                count += 1
    return [count, rejected]
''',[("Quoted fields and invalid rows","import_check(False)",[[2,[3,4,6]],[[1,'Ari, Tan',90],[3,'Mei',0]]]),("Repeated import","import_check(True)",[[0,[2,3,4,5,6]],[[1,'Ari, Tan',90],[3,'Mei',0]]]),('Database rollback','rollback_check()',True)],topic='Databases',level='Stretch',minutes=40,starter='def import_register(conn, path):\n    pass\n',files={'register.csv':'id,name,score\n1,"Ari, Tan",90\n2,,50\n1,Duplicate,80\n3,Mei,0\n4,Kai,101\n'},setup='''
import sqlite3
def connection():
    c=sqlite3.connect(':memory:');c.execute('CREATE TABLE Student(id INTEGER PRIMARY KEY,name TEXT NOT NULL,score INTEGER CHECK(score BETWEEN 0 AND 100))');return c
def import_check(twice):
    c=connection();r=import_register(c,'register.csv')
    if twice:r=import_register(c,'register.csv')
    return [r,[list(v) for v in c.execute('SELECT * FROM Student ORDER BY id')]]
def rollback_check():
    c=connection();c.execute("CREATE TRIGGER blocked BEFORE INSERT ON Student WHEN NEW.id=3 BEGIN SELECT RAISE(ABORT,'test failure'); END")
    try:import_register(c,'register.csv')
    except sqlite3.DatabaseError:return c.execute('SELECT COUNT(*) FROM Student').fetchone()[0]==0
    return False
''')
add('hash-lookup','Find a record after hash collisions','1.2.3 / 2.3.2',
'''Implement lookup(table, key). table is a nonempty fixed-size linear-probing hash table containing non-negative integer keys or None; keys were inserted using key % len(table), with wraparound and no deletions. Return the matching index or -1. Stop on None or after inspecting every slot. Do not mutate table or use list.index. Empty table returns -1.''',
'''
def lookup(table, key):
    if not table:
        return -1
    position = key % len(table)
    for _ in range(len(table)):
        if table[position] is None:
            return -1
        if table[position] == key:
            return position
        position = (position + 1) % len(table)
    return -1
''',[('Wraparound','lookup([9,14,None,None,4],14)',1),('Full and absent','lookup([0,1,2],8)',-1),('Empty','lookup([],7)',-1),('Home slot','lookup([0,None,None],0)',0),('Stop at gap','lookup([None,1,None],4)',-1)],topic='Algorithms')
add('repair-queue','Repair the queue','1.3.3 / 2.3.3 / 2.4.3–2.4.4',
'''Repair Queue(capacity), a bounded circular queue. capacity is a positive integer. put(value) returns True or False if full; get() returns the oldest integer or None if empty. Keep fixed data storage and head, tail, count. Add a brief comment diagnosing each starter bug and a test that reproduces it. Behaviour is auto-checked; review your explanations separately.''',
'''
class Queue:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.head = self.tail = self.count = 0
    def put(self, value):
        # Full means count equals capacity, not capacity minus one.
        if self.count == len(self.data):
            return False
        self.data[self.tail] = value
        self.tail = (self.tail + 1) % len(self.data)
        self.count += 1
        return True
    def get(self):
        # Check empty before accessing or changing a pointer.
        if self.count == 0:
            return None
        value = self.data[self.head]
        self.data[self.head] = None
        # Wrap the head and reduce the count after removal.
        self.head = (self.head + 1) % len(self.data)
        self.count -= 1
        return value
''',[('Single slot','queue_check(1)',[None,True,False,7,True,9,None]),('Wraparound','queue_wrap()',[1,2,3,4,None])],topic='Data structures',minutes=30,starter='''class Queue:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.head = self.tail = self.count = 0
    def put(self, value):
        if self.count == len(self.data) - 1:
            return False
        self.data[self.tail] = value
        self.tail += 1
        self.count += 1
        return True
    def get(self):
        value = self.data[self.head]
        self.head += 1
        return value
''',setup='''
def queue_check(n):
    q=Queue(n);return [q.get(),q.put(7),q.put(8),q.get(),q.put(9),q.get(),q.get()]
def queue_wrap():
    q=Queue(2);q.put(1);q.put(2);a=q.get();q.put(3);b=q.get();q.put(4);return [a,b,q.get(),q.get(),q.get()]
''',rubric=['Explain full/empty checks and pointer wraparound.','Show a test that fails for each original bug.'])
add('recursive-trace','Trace recursive returns','2.2.5–2.2.7',
'''Implement trace_sum(values) using a recursive helper with index i. Emit ["enter", i] before each call checks its base case, including i == len(values). Emit ["return", i, total] just before each call returns its suffix sum. Return the complete event list; do not change values. Each recursive call waits for exactly one smaller subproblem.''',
'''
def trace_sum(values):
    events = []
    def visit(i):
        events.append(['enter', i])
        if i == len(values):
            total = 0
        else:
            total = values[i] + visit(i + 1)
        events.append(['return', i, total])
        return total
    visit(0)
    return events
''',[('Two calls plus base','trace_sum([3,4])',[['enter',0],['enter',1],['enter',2],['return',2,0],['return',1,4],['return',0,7]]),('Empty','trace_sum([])',[['enter',0],['return',0,0]]),('Negative','trace_sum([-2])',[['enter',0],['enter',1],['return',1,0],['return',0,-2]])])
add('structure-interface','A queue and stack sharing an interface','2.5.1–2.5.4 / 1.3.3 / 2.3.3',
'''Define BoundedQueue(capacity) with put(value) and take(), returning True/False and integer/None respectively. Define BoundedStack as its subclass, overriding take() for LIFO. dispatch(container, operations) calls these methods polymorphically for ["put", value] and ["take"] operations. Use separate instance storage. Capacity is positive. Do not branch on type, class name or isinstance in dispatch; it must also work with an unrelated object implementing the interface. Review encapsulation and inheritance in your explanation.''',
'''
class BoundedQueue:
    def __init__(self, capacity):
        self._capacity = capacity
        self._items = []
    def put(self, value):
        if len(self._items) == self._capacity:
            return False
        self._items.append(value)
        return True
    def take(self):
        return self._items.pop(0) if self._items else None
class BoundedStack(BoundedQueue):
    def take(self):
        return self._items.pop() if self._items else None
def dispatch(container, operations):
    return [container.put(op[1]) if op[0] == 'put' else container.take() for op in operations]
''',[('FIFO','dispatch(BoundedQueue(2),ops)',[True,True,False,1,2,None]),('LIFO','dispatch(BoundedStack(2),ops)',[True,True,False,2,1,None]),('Independent instances','independent()',True),('Interface without subclass','dispatch(Fake(),[["take"]])',[42])],topic='Data structures',level='Stretch',minutes=40,starter='class BoundedQueue:\n    pass\n\nclass BoundedStack(BoundedQueue):\n    pass\n\ndef dispatch(container, operations):\n    pass\n',setup='''
ops=[['put',1],['put',2],['put',3],['take'],['take'],['take']]
class Fake:
    def take(self):return 42
def independent():
    a=BoundedQueue(1);b=BoundedQueue(1);a.put(8);return b.take() is None and issubclass(BoundedStack,BoundedQueue)
''',rubric=['Dispatcher uses interface calls rather than concrete type tests.','Explain what state is encapsulated and what behaviour is overridden.'])
add('master-update','Update a sequential master file','2.3.4 / 1.1.5 / 2.2.4',
'''Implement apply_updates(master_path, changes_path, output_path). Master CSV has no header: integer ID,name, sorted by unique ID. Changes CSV has no header: ID,operation,name, sorted by ID; same-ID changes occur in execution order. Operations are I (insert only if absent), U (update only if present), D (delete if present; name ignored). Merge the sorted streams, retaining only final surviving records. Write ID,name with CSV quoting and LF newlines in ID order; return record count. Names may contain commas. Do not modify either input; output_path is distinct. Do not load the full master file into memory.''',
'''
import csv

def apply_updates(master_path, changes_path, output_path):
    count = 0
    with open(master_path, newline='') as master, open(changes_path, newline='') as changes, open(output_path, 'w', newline='') as output:
        masters, updates = csv.reader(master), csv.reader(changes)
        writer = csv.writer(output, lineterminator='\n')
        record, change = next(masters, None), next(updates, None)
        while record is not None or change is not None:
            key = min(int(x[0]) for x in [record, change] if x is not None)
            name = None
            if record is not None and int(record[0]) == key:
                name = record[1]
                record = next(masters, None)
            while change is not None and int(change[0]) == key:
                operation, value = change[1:]
                if operation == 'I' and name is None or operation == 'U' and name is not None:
                    name = value
                elif operation == 'D':
                    name = None
                change = next(updates, None)
            if name is not None:
                writer.writerow([key, name])
                count += 1
    return count
'''.replace("lineterminator='\n'","lineterminator='\\n'"),[('Ordered transactions','master_check()', [3,'1,New\n3,Kai\n4,"Jo, Tan"\n',True]),('Empty files','master_empty()',[0,''])],level='Stretch',minutes=35,starter='def apply_updates(master_path, changes_path, output_path):\n    pass\n',files={'master.csv':'1,Ari\n2,Mei\n4,"Jo, Tan"\n','changes.csv':'1,U,New\n2,D,\n3,U,Ignored\n3,I,Kai\n3,I,Duplicate\n'},setup='''
from pathlib import Path
def master_check():
    before=Path('master.csv').read_text();n=apply_updates('master.csv','changes.csv','out.csv')
    return [n,Path('out.csv').read_text(),Path('master.csv').read_text()==before]
def master_empty():
    Path('a').write_text('');Path('b').write_text('');n=apply_updates('a','b','out');return [n,Path('out').read_text()]
''')
add('joined-totals','Totals across three related tables','3.3.8',
'''Implement totals(conn). Customer(id,name), Orders(id,customer_id) and Line(order_id,item,quantity,unit_price) already exist. Prices are integer cents, quantity positive, unit_price may be NULL (treat as zero). Return [customer_id,name,total_cents] for EVERY customer, descending total then ascending customer_id. Group by ID, not name. Customers without orders have zero total. Use one parameter-free SELECT query and return lists.''',
'''
def totals(conn):
    query = '''+'"""'+'''
        SELECT c.id, c.name, COALESCE(SUM(l.quantity * COALESCE(l.unit_price, 0)), 0)
        FROM Customer c LEFT JOIN Orders o ON o.customer_id = c.id
        LEFT JOIN Line l ON l.order_id = o.id
        GROUP BY c.id, c.name ORDER BY 3 DESC, c.id ASC
    '''+'"""'+'''
    return [list(row) for row in conn.execute(query)]
''',[('Repeated names and missing data','totals(conn)',[[1,'Ari',550],[2,'Ari',300],[3,'Mei',0],[4,'Kai',0]]),('No lines','empty_lines()',[[1,'Ari',0],[2,'Ari',0],[3,'Mei',0],[4,'Kai',0]])],topic='Databases',level='Stretch',minutes=30,setup='''
import sqlite3
conn=sqlite3.connect(':memory:')
conn.executescript("""
CREATE TABLE Customer(id INTEGER PRIMARY KEY,name TEXT);
CREATE TABLE Orders(id INTEGER PRIMARY KEY,customer_id INTEGER);
CREATE TABLE Line(order_id INTEGER,item TEXT,quantity INTEGER,unit_price INTEGER);
INSERT INTO Customer VALUES(1,'Ari'),(2,'Ari'),(3,'Mei'),(4,'Kai');
INSERT INTO Orders VALUES(10,1),(11,1),(12,2),(13,4);
INSERT INTO Line VALUES(10,'A',2,100),(10,'B',1,50),(11,'C',3,100),(12,'A',3,100),(13,'D',1,NULL);
""")
def empty_lines():
    conn.execute('DELETE FROM Line');return totals(conn)
''')
add('shared-pool','Shared storage, two linked lists','1.3.1 / 1.3.4–1.3.5 / 2.3.3 / 2.5.1',
'''Implement Pool(capacity) for two sorted singly linked lists sharing one fixed node pool. Public data and next arrays have capacity slots; heads is [head0,head1]; free is the free-list head; -1 is null. Initially every slot is free and data entries None. insert(which,value) returns False if that list already contains value or storage is full; otherwise allocate from free and insert ascending. delete(which,value) returns False if absent; otherwise clear its data and recycle the slot to the front of free. values(which) traverses that list. which is 0 or 1; capacity is positive. The same value may exist in both lists. Use the arrays for storage; no additional dynamic value list.''',
'''
class Pool:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.next = list(range(1, capacity)) + [-1]
        self.heads = [-1, -1]
        self.free = 0
    def insert(self, which, value):
        previous, current = -1, self.heads[which]
        while current != -1 and self.data[current] < value:
            previous, current = current, self.next[current]
        if current != -1 and self.data[current] == value or self.free == -1:
            return False
        node = self.free
        self.free = self.next[node]
        self.data[node], self.next[node] = value, current
        if previous == -1:
            self.heads[which] = node
        else:
            self.next[previous] = node
        return True
    def delete(self, which, value):
        previous, current = -1, self.heads[which]
        while current != -1 and self.data[current] != value:
            previous, current = current, self.next[current]
        if current == -1:
            return False
        if previous == -1:
            self.heads[which] = self.next[current]
        else:
            self.next[previous] = self.next[current]
        self.data[current] = None
        self.next[current], self.free = self.free, current
        return True
    def values(self, which):
        result, current = [], self.heads[which]
        while current != -1:
            result.append(self.data[current])
            current = self.next[current]
        return result
''',[('Reuse across lists','pool_check()',[[True,True,True,False,True,True],[2,3],[1],True]),('Only slot','pool_single()',[True,False,True,True,[],[9],True])],topic='Data structures',level='Stretch',minutes=45,starter='class Pool:\n    def __init__(self, capacity):\n        pass\n    def insert(self, which, value):\n        pass\n    def delete(self, which, value):\n        pass\n    def values(self, which):\n        pass\n',setup='''
def invariant(p):
    seen=set()
    for head in p.heads+[p.free]:
        while head!=-1:
            if not isinstance(head,int) or head<0 or head>=len(p.data) or head in seen:return False
            seen.add(head);head=p.next[head]
    return len(seen)==len(p.data)==len(p.next)
def pool_check():
    p=Pool(3);r=[p.insert(0,3),p.insert(0,1),p.insert(1,1),p.insert(1,2),p.delete(0,1),p.insert(0,2)]
    return [r,p.values(0),p.values(1),invariant(p)]
def pool_single():
    p=Pool(1);r=[p.insert(0,7),p.insert(1,9),p.delete(0,7),p.insert(1,9)]
    return r+[p.values(0),p.values(1),invariant(p)]
''')
add('editable-records','Ordered records with editable payloads','1.3.5 / 2.3.3 / 2.5.1–2.5.2',
'''Implement Records() as an object-based sorted singly linked list. insert(key,name), edit(key,name) and delete(key) return success booleans. Duplicate insert is False. find(key) returns name or None. rows() returns ordered [key,name] pairs. Key is an immutable integer identifier; edit changes only the name. Empty names are allowed. Expose head; each Node has key,name,next attributes. Use Node links, not a list or dictionary as the main storage.''',
'''
class Node:
    def __init__(self, key, name, next=None):
        self.key, self.name, self.next = key, name, next
class Records:
    def __init__(self):
        self.head = None
    def _locate(self, key):
        previous, current = None, self.head
        while current is not None and current.key < key:
            previous, current = current, current.next
        return previous, current
    def insert(self, key, name):
        previous, current = self._locate(key)
        if current is not None and current.key == key:
            return False
        new = Node(key, name, current)
        if previous is None:
            self.head = new
        else:
            previous.next = new
        return True
    def edit(self, key, name):
        _, current = self._locate(key)
        if current is None or current.key != key:
            return False
        current.name = name
        return True
    def delete(self, key):
        previous, current = self._locate(key)
        if current is None or current.key != key:
            return False
        if previous is None:
            self.head = current.next
        else:
            previous.next = current.next
        return True
    def find(self, key):
        _, current = self._locate(key)
        return current.name if current is not None and current.key == key else None
    def rows(self):
        result, current = [], self.head
        while current is not None:
            result.append([current.key, current.name])
            current = current.next
        return result
''',[('Edit without changing order','records_check()',[[True,True,False,True,False],[[1,'Mei'],[3,'New']],'New']),('Delete head and only node','records_delete()',[True,True,False,[],None])],topic='Data structures',level='Stretch',minutes=35,starter='class Records:\n    pass\n',setup='''
def records_check():
    r=Records();ops=[r.insert(3,'Ari'),r.insert(1,'Mei'),r.insert(3,'Dup'),r.edit(3,'New'),r.edit(8,'None')];return [ops,r.rows(),r.find(3)]
def records_delete():
    r=Records();r.insert(1,'A');r.insert(2,'B');return [r.delete(1),r.delete(2),r.delete(2),r.rows(),r.head]
''')
add('tournament-tree','A tournament binary tree','1.3.6–1.3.7 / 2.2.5 / 2.3.3',
'''Implement Tree(records, root). Each record is [id, payload, left_id, right_id]; None is no child. IDs are unique strings, payloads may repeat. Empty records with root=None is valid. Reject duplicate/missing IDs, an unknown root, cycles, shared children or unreachable nodes with ValueError. traverse(order) returns payloads for "pre", "in" or "post"; reject other orders. edit(id,payload) returns False if absent, otherwise changes only that payload and returns True. This is a general binary tree, not a BST. Use recursion for validation and traversal.''',
'''
class Tree:
    def __init__(self, records, root):
        self.nodes = {}
        for key, value, left, right in records:
            if key in self.nodes:
                raise ValueError('Duplicate ID')
            self.nodes[key] = [value, left, right]
        self.root = root
        seen = set()
        def visit(key):
            if key is None:
                return
            if key not in self.nodes or key in seen:
                raise ValueError('Missing, shared or cyclic node')
            seen.add(key)
            visit(self.nodes[key][1])
            visit(self.nodes[key][2])
        visit(root)
        if len(seen) != len(self.nodes):
            raise ValueError('Unreachable node')
    def edit(self, key, value):
        if key not in self.nodes:
            return False
        self.nodes[key][0] = value
        return True
    def traverse(self, order):
        if order not in ['pre', 'in', 'post']:
            raise ValueError('Invalid traversal')
        result = []
        def visit(key):
            if key is None:
                return
            value, left, right = self.nodes[key]
            if order == 'pre':
                result.append(value)
            visit(left)
            if order == 'in':
                result.append(value)
            visit(right)
            if order == 'post':
                result.append(value)
        visit(self.root)
        return result
''',[('Three orders','[Tree(records,"a").traverse(o) for o in ["pre","in","post"]]',[[8,3,3],[3,8,3],[3,3,8]]),('Empty','Tree([],None).traverse("in")',[]),('Reject invalid graph','invalid_trees()',[True,True,True]),('Edit payload','edit_tree()',[True,False,[3,9,3]])],topic='Data structures',level='Stretch',minutes=40,starter='class Tree:\n    pass\n',setup='''
records=[['a',8,'b','c'],['b',3,None,None],['c',3,None,None]]
def invalid_trees():
    bad=[[['a',1,'a',None]],[['a',1,'x',None]],[['a',1,None,None],['b',2,None,None]]];out=[]
    for rows in bad:
        try:Tree(rows,'a');out.append(False)
        except ValueError:out.append(True)
    return out
def edit_tree():
    t=Tree(records,'a');return [t.edit('a',9),t.edit('x',0),t.traverse('in')]
''')
add('eligibility-table','Three-condition eligibility rules','1.1.3–1.1.5 / 2.2.3–2.2.4',
'''Implement eligibility(member, paid, space), three booleans. If no space, return "waitlist". Otherwise, an unpaid applicant returns "payment required". Otherwise return "member place" for members and "guest place" for guests. Write a decision table covering all eight combinations in your notes and decompose your reasoning into space, payment and membership decisions. Return strings exactly as specified.''',
'''
def eligibility(member, paid, space):
    if not space:
        return 'waitlist'
    if not paid:
        return 'payment required'
    return 'member place' if member else 'guest place'
''',[('Member admitted','eligibility(True,True,True)','member place'),('No space takes precedence','eligibility(False,False,False)','waitlist'),('All combinations','[eligibility(m,p,s) for m in [False,True] for p in [False,True] for s in [False,True]]',['waitlist','payment required','waitlist','guest place','waitlist','payment required','waitlist','member place'])],minutes=20,rubric=['List all eight decision-table columns.','Explain why the no-space rule takes precedence.'])
add('repair-importer','Repair a broken importer','2.4.3 / 2.1.1–2.1.3 / 2.3.4',
'''Repair read_scores(path). Each UTF-8 line is name,score with no header or quoted commas. Strip both fields. Keep nonempty names with integer scores 0–100 inclusive; skip malformed rows. Return [records,rejected_line_numbers] in input order, using 1-based lines. Empty file returns [[],[]]; let FileNotFoundError propagate. Include programmer/date/purpose/version comments, meaningful names, and a short diagnosis of syntax, runtime and logic bugs. Behaviour is checked automatically; style is reviewed separately.''',
'''
# Programmer: Reference author; Date: 2026-09-10
# Purpose: Validate score records; Version: 1.0

def read_scores(path):
    records, rejected = [], []
    with open(path, encoding='utf-8') as handle:
        for line, text in enumerate(handle, 1):
            fields = text.strip().split(',')
            try:
                if len(fields) != 2 or not fields[0].strip():
                    raise ValueError('Bad fields')
                score = int(fields[1].strip())
                if not 0 <= score <= 100:
                    raise ValueError('Out of range')
            except ValueError:
                rejected.append(line)
            else:
                records.append([fields[0].strip(), score])
    return [records, rejected]
''',[('Malformed and boundary rows','read_scores("scores.txt")',[[['Ari',0],['Mei',100]],[3,4,5,6]]),('Empty','read_scores("empty.txt")',[[],[]])],minutes=25,files={'scores.txt':'Ari,0\nMei,100\nBad,101\n,50\nJo,x\nwrong\n','empty.txt':''},starter='''def read_scores(path)
    r = []
    for l in open(path):
        n, s = l.split(',')
        s = int(s)
        if s > 0 or s < 100:
            r.append([n, s])
    return r
''',rubric=['Explain the missing colon, unsafe split/conversion and incorrect range condition.','Show normal, abnormal and boundary test cases.','Review naming, indentation and header/version comments.'])
add('design-tests','Choose tests that expose the bug','2.4.2–2.4.4',
'''Write cases() returning [label,value,expected] rows for a validator: valid scores have type exactly int (not bool) and are 0–100 inclusive. labels are "normal", "abnormal" or "extreme"; expected is bool. Use 3–10 distinct values, including an interior integer, both endpoints, an out-of-range integer, a string and a boolean. Your cases must expose these four faulty validators: excludes zero; accepts 101; treats bool as int; coerces numeric strings. Tests check expected answers and whether the examples actually distinguish the faults. Review why each category was chosen.''',
'''
def cases():
    return [
        ['normal', 50, True],
        ['extreme', 0, True],
        ['extreme', 100, True],
        ['abnormal', 101, False],
        ['abnormal', '50', False],
        ['abnormal', True, False],
    ]
''',[('Expected answers and categories','test_quality()',True),('Faults exposed','mutants_killed()',[True,True,True,True])],minutes=20,setup='''
def valid(v):return type(v) is int and 0<=v<=100
def test_quality():
    data=cases()
    if not 3<=len(data)<=10:return False
    keys=[(type(v).__name__,repr(v)) for _,v,_ in data]
    if len(set(keys))!=len(data):return False
    for label,v,e in data:
        if type(e) is not bool or e!=valid(v):return False
        expected='extreme' if type(v) is int and v in [0,100] else 'normal' if valid(v) else 'abnormal'
        if label!=expected:return False
    return all(any(type(v) is int and v==n for _,v,_ in data) for n in [0,100]) and any(l=='normal' for l,_,_ in data) and any(type(v) is str for _,v,_ in data) and any(type(v) is bool for _,v,_ in data) and any(type(v) is int and not valid(v) for _,v,_ in data)
def mutants_killed():
    bugs=[lambda v:type(v) is int and 0<v<=100,lambda v:type(v) is int and 0<=v<=101,lambda v:isinstance(v,int) and 0<=v<=100,lambda v:(type(v) is int and 0<=v<=100) or (type(v) is str and v.isdigit() and 0<=int(v)<=100)]
    return [any(bool(bug(v))!=e for _,v,e in cases()) for bug in bugs]
''',rubric=['Explain which example exposes each faulty validator.'])
add('comparison-counts','Count comparisons, explain worst case','1.2.2 / 1.2.4–1.2.5 / 2.2.6',
'''Implement counts(values,target) returning [bubble,insertion,binary]. Work on copies. Bubble sort scans adjacent pairs in shrinking passes and stops after a pass with no swaps; count each value > value comparison. Insertion sort counts each a[j] > key comparison, including a false comparison, but not the j>=0 boundary check. Binary search uses the sorted input, floor midpoint, and stops at any match; count one probe per inspected midpoint. No mutation of values. In your review explain worst-case time, rather than using measured runtime as proof.''',
'''
def counts(values, target):
    a, bubble = values[:], 0
    for end in range(len(a) - 1, 0, -1):
        changed = False
        for j in range(end):
            bubble += 1
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                changed = True
        if not changed:
            break
    b, insertion = values[:], 0
    for i in range(1, len(b)):
        key, j = b[i], i - 1
        while j >= 0:
            insertion += 1
            if b[j] <= key:
                break
            b[j + 1] = b[j]
            j -= 1
        b[j + 1] = key
    left, right, binary = 0, len(a) - 1, 0
    while left <= right:
        mid = (left + right) // 2
        binary += 1
        if a[mid] == target:
            break
        if a[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return [bubble, insertion, binary]
''',[('Sorted input','counts([1,2,3,4],4)',[3,3,3]),('Reverse input','counts([4,3,2,1],0)',[6,6,2]),('Empty','counts([],3)',[0,0,0]),('Duplicates','counts([2,2,2],2)',[2,2,1])],topic='Algorithms',rubric=['Explain quadratic worst-case sorting and logarithmic binary-search probes.','Distinguish probes from individual Python boolean comparisons.'])
add('base-records','Denary, binary and hexadecimal records','3.1.1–3.1.2 / 2.4.2',
'''Implement convert_records(records). Each [base,text] uses base 2, 10 or 16. For each record return [decimal_integer,uppercase_hex_string], or None if unsupported base, empty text, invalid digit or a negative sign. Accept leading zeros and lowercase hex, but not spaces or prefixes. Zero is an allowed extension. Use positional arithmetic to parse and repeated division to format; do not call int(text,base), bin, hex or formatting-based conversion.''',
'''
def convert_records(records):
    digits = '0123456789ABCDEF'
    output = []
    for base, text in records:
        text = text.upper()
        if base not in [2, 10, 16] or not text or any(c not in digits[:base] for c in text):
            output.append(None)
            continue
        value = 0
        for c in text:
            value = value * base + digits.index(c)
        number, encoded = value, ''
        while number:
            encoded = digits[number % 16] + encoded
            number //= 16
        output.append([value, encoded or '0'])
    return output
''',[('Mixed records','convert_records([[2,"00101"],[16,"ff"],[10,"256"],[2,"102"]])',[[5,'5'],[255,'FF'],[256,'100'],None]),('Zero and invalid','convert_records([[10,"0"],[16,""],[10,"-2"],[8,"7"],[16," FF"]])',[[0,'0'],None,None,None,None]),('Large value','convert_records([[16,"FFFFFFFF"]])',[[4294967295,'FFFFFFFF']])],minutes=20)
add('ascii-boundaries','ASCII and Unicode boundary cases','3.2.1–3.2.2 / 2.2.2',
'''Implement shift_ascii(text,step): rotate ASCII A–Z and a–z independently by step (any integer); leave digits, punctuation and all other Unicode characters unchanged. Return [shifted_text,character_count,utf8_byte_count] for the result. Use ord/chr for shifts. In your notes explain why a Unicode character and a UTF-8 byte are not interchangeable.''',
'''
def shift_ascii(text, step):
    result = ''
    for char in text:
        if 'A' <= char <= 'Z':
            char = chr((ord(char) - ord('A') + step) % 26 + ord('A'))
        elif 'a' <= char <= 'z':
            char = chr((ord(char) - ord('a') + step) % 26 + ord('a'))
        result += char
    return [result, len(result), len(result.encode('utf-8'))]
''',[('Preserve Unicode','shift_ascii("Az é中1!",1)',['Ba é中1!',7,10]),('Negative shift','shift_ascii("AaZz",-1)',['ZzYy',4,4]),('Empty','shift_ascii("",100)', ['',0,0])],minutes=20,rubric=['Explain code points versus UTF-8 bytes using the non-ASCII example.'])
add('deferred-work','Multi-day deferred work','2.3.4 / 1.3.3 / 2.5.1 / 2.2.4',
'''Implement Scheduler(limit).run(incoming_path,deferred_path). Files are JSON arrays of [unique_id,positive_duration] records; absent files mean []. Pending deferred work precedes new work; IDs are unique across both inputs. Scan once in order: schedule each job if it fits the remaining limit, otherwise defer it and continue. Return scheduled IDs. Persist deferred jobs and replace incoming with [] after a successful run. Test on consecutive days; oversized jobs remain pending without an infinite loop. limit is nonnegative. Use a class and separate read/write helpers. File-write crash recovery is outside this exercise.''',
'''
import json
from pathlib import Path

class Scheduler:
    def __init__(self, limit):
        self.limit = limit
    def _read(self, path):
        return json.loads(Path(path).read_text()) if Path(path).exists() else []
    def _write(self, path, records):
        Path(path).write_text(json.dumps(records))
    def run(self, incoming_path, deferred_path):
        pending = self._read(deferred_path) + self._read(incoming_path)
        remaining, scheduled, deferred = self.limit, [], []
        for key, duration in pending:
            if duration <= remaining:
                scheduled.append(key)
                remaining -= duration
            else:
                deferred.append([key, duration])
        self._write(deferred_path, deferred)
        self._write(incoming_path, [])
        return scheduled
''',[('Consecutive days','days_check()', [['a','c'],['b'],[['huge',20]],[]]),('Missing files','Scheduler(0).run("missing","deferred")',[])],level='Stretch',minutes=40,starter='class Scheduler:\n    pass\n',setup='''
import json
from pathlib import Path
def days_check():
    Path('new').write_text(json.dumps([['a',6],['b',5],['c',4],['huge',20]]))
    s=Scheduler(10);first=s.run('new','later');second=s.run('new','later')
    return [first,second,json.loads(Path('later').read_text()),json.loads(Path('new').read_text())]
''')
add('word-paths','Word paths with stable ranking','2.2.1–2.2.4 / 1.2.1 / 2.3.1',
'''Implement rank_paths(board,scores,paths). board is a nonempty rectangular array of one-character strings; scores has the same dimensions and integer entries. Each path is [row,column,directions], with U/D/L/R moves. Include the starting tile, then each visited tile; repeated visits are allowed and score again. Skip paths with an invalid start, invalid direction or out-of-bounds move. Return [word,total_score] records descending by score, preserving input order for ties. Use separate path validation/scoring and stable bubble sort; no sorted() or list.sort().''',
'''
def rank_paths(board, scores, paths):
    moves = {'U': (-1, 0), 'D': (1, 0), 'L': (0, -1), 'R': (0, 1)}
    def follow(row, col, directions):
        word, total = '', 0
        for direction in 'S' + directions:
            if direction != 'S':
                if direction not in moves:
                    return None
                dr, dc = moves[direction]
                row, col = row + dr, col + dc
            if not 0 <= row < len(board) or not 0 <= col < len(board[0]):
                return None
            word += board[row][col]
            total += scores[row][col]
        return [word, total]
    result = []
    for row, col, directions in paths:
        if any(d not in moves for d in directions):
            continue
        record = follow(row, col, directions)
        if record is not None:
            result.append(record)
    for end in range(len(result) - 1, 0, -1):
        for i in range(end):
            if result[i][1] < result[i + 1][1]:
                result[i], result[i + 1] = result[i + 1], result[i]
    return result
''',[('Stable ties and invalid moves','rank_paths([["A","B"],["C","D"]],[[1,2],[2,1]],[[0,0,"R"],[0,0,"D"],[0,0,"U"],[1,1,""]])',[['AB',3],['AC',3],['D',1]]),('Repeated visits','rank_paths([["A","B"]],[[1,2]],[[0,0,"RL"],[0,0,"S"]])',[['ABA',4]]),('Invalid starts','rank_paths([["A"]],[[1]],[[-1,0,""],[1,0,""]])',[])],level='Stretch',minutes=35)

from refinements import refine
refine(new)

if __name__=='__main__':
    bank=json.loads(Path('app/problems.json').read_text())
    ids={p['id'] for p in new};bank=[p for p in bank if p['id'] not in ids]+new
    Path('app/problems.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'automatic-ids.json').write_text(json.dumps(sorted(ids),indent=2)+'\n')
    print('Added/updated',len(new),'automatic exercises')
