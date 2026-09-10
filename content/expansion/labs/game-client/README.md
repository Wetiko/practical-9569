# Implement the missing game client

Syllabus: 4.1.5–4.1.6 / 2.2.3. Estimated 45 minutes. Original synthetic practice project.

Use the supplied deterministic server.py. Implement play(connection, moves), reading newline-delimited JSON messages: info is informational; turn/retry requests the next [row,col] move; done returns its result string. Unknown message types or exhausted moves raise ValueError. EOF, oversized or incomplete lines before done raise ConnectionError. Support split/coalesced messages, invalid-move retry and normal termination. Start the supplied server and run your client over loopback.

## Work in this order
1. Read this contract and test_lab.py; implement starter.py.
2. Review/edit the supplied HTML and CSS where present.
3. Run tests, then inspect the real application or network session.
4. Record your own normal, abnormal and boundary tests.
5. Compare with solution.py only after attempting the task.

## Setup and checks
Use Python 3.10 or newer in a virtual environment.

```sh
python -m venv .venv
# macOS/Linux: source .venv/bin/activate
# Windows: .venv\Scripts\activate
python -m pip install -r requirements.txt
python -m unittest -v test_lab.py
```

Tests load starter.py by default. To check the reference instead, set LAB_MODULE=solution (macOS/Linux: `LAB_MODULE=solution python -m unittest -v test_lab.py`; PowerShell: `$env:LAB_MODULE="solution"` then run the test command). Test failure for the unfinished starter is expected.

## Run manually
Terminal 1: python server.py. Terminal 2: python solution.py (or your client entry point).


## Protocol
Read each UTF-8 JSON line up to 4096 bytes, including newline. On {"type":"info",...}, keep reading. On turn or retry send {"row":row,"col":col} from the next move. On {"type":"done","result":"win"} return "win". The server treats row/col outside 0–1 as invalid; (1,1) wins. Use a connection timeout in your client entry point.

## Review checklist
- [ ] Read one complete JSON message at a time without losing coalesced data.
- [ ] Send one move for each turn or retry, and ignore informational messages.
- [ ] Pass disconnect/framing checks and complete a real client/server session.

These local learning apps do not include production authentication. Use fictional data and loopback addresses. The tests exercise behaviour; manually review your code structure and rendered pages too.

References: [Flask testing](https://flask.palletsprojects.com/en/stable/testing/), [Flask uploads](https://flask.palletsprojects.com/en/stable/patterns/fileuploads/), [PyMongo connections](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/connect/).
