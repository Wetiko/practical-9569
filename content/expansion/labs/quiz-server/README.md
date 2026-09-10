# Implement the missing quiz server

Syllabus: 4.1.5–4.1.6 / 2.5.1–2.5.2. Estimated 50 minutes. Original synthetic practice project.

Use the supplied client.py and protocol to implement an iterative quiz server in starter.py. Each connection sends a JSON username line, answers two questions and receives its own score. Define Question and QuizSession classes and serve(listener, max_clients=None). Preserve message boundaries across recv chunks. A partial/invalid/disconnected client must not prevent the next connection. The reference questions and exact protocol are documented in README.md; test on loopback only.

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
Terminal 1: python solution.py (or your server entry point). Terminal 2: python client.py.


## Exact quiz protocol
UTF-8 JSON, one object plus newline per message, maximum 4096 bytes including newline. First client message: {"username":"Ari"}. Server asks {"type":"question","number":1,"text":"2 + 3? A: 4, B: 5"}; client replies {"answer":"B"}. Question 2 text: "FIFO structure? A: queue, B: stack"; correct answer A. Trim and uppercase answers. Finally send {"type":"result","username":"Ari","score":2}. Only the client that answered correctly gets that score. Timeout each connection after 3 seconds of inactivity. Close malformed clients and keep accepting the next client. max_clients is provided for tests; None means continue.

## Review checklist
- [ ] Implement Question.correct and per-client QuizSession state.
- [ ] Support newline framing with a 4096-byte message limit and a timeout.
- [ ] Serve multiple connections sequentially; recover from a client disconnect and keep scores isolated.

These local learning apps do not include production authentication. Use fictional data and loopback addresses. The tests exercise behaviour; manually review your code structure and rendered pages too.

References: [Flask testing](https://flask.palletsprojects.com/en/stable/testing/), [Flask uploads](https://flask.palletsprojects.com/en/stable/patterns/fileuploads/), [PyMongo connections](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/connect/).
