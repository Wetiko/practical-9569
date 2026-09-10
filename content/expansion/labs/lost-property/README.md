# Document-backed lost property

Syllabus: 3.3.8 / 2.4.2 / 4.2.2–4.2.4. Estimated 55 minutes. Original synthetic practice project.

Implement create_app(collection=None) with Flask and real PyMongo. POST / validates a title, an exact ISO calendar date and category Books/Clothing/Other, then stores an unclaimed report with a unique generated report_id. GET / supports optional day/category filters. POST /claim/<report_id> marks exactly one matching report claimed, or returns 404. Reject bad input with HTTP 400 without writing. Use a dedicated local MongoDB database and the real-server integration tests in the pack.

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
python solution.py (reference only); add a main entry point to starter.py to run your implementation.


## Real MongoDB
Start your installed MongoDB server locally. Default URI: mongodb://127.0.0.1:27017; override with MONGO_URI. The reference app uses practical_lost_property.reports. Tests use a newly generated practical_test_<uuid> database and delete only that test database afterwards. Tests deliberately fail if MongoDB is unavailable; they do not silently substitute an emulator.

## Review checklist
- [ ] Validate real calendar dates and controlled categories; reject bad input without writes.
- [ ] Create a unique report_id index, filter documents and update one selected report.
- [ ] Run integration tests against real MongoDB and inspect the labelled web forms.

These local learning apps do not include production authentication. Use fictional data and loopback addresses. The tests exercise behaviour; manually review your code structure and rendered pages too.

References: [Flask testing](https://flask.palletsprojects.com/en/stable/testing/), [Flask uploads](https://flask.palletsprojects.com/en/stable/patterns/fileuploads/), [PyMongo connections](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/connect/).
