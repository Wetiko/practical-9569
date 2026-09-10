# Searchable bookings portal

Syllabus: 4.2.2–4.2.4 / 3.3.8. Estimated 55 minutes. Original synthetic practice project.

Implement create_app(database). The SQLite database contains Customer, Event and Booking tables. Seed two customers and two events only if absent. GET / accepts optional exact day/category filters and displays joined bookings, including an empty-results message. POST / validates customer/event IDs and quantity 1–8, inserts with parameters and redirects. Reject duplicates or invalid input with HTTP 400 without a write. Build and inspect the labelled HTML forms and results table.

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


## Review checklist
- [ ] Filter by category and real ISO date; include an empty-results view.
- [ ] Validate and parameterise every booking insert; verify persistence after restarting.
- [ ] Run test_lab.py and review semantic labels, table headings and keyboard access.

These local learning apps do not include production authentication. Use fictional data and loopback addresses. The tests exercise behaviour; manually review your code structure and rendered pages too.

References: [Flask testing](https://flask.palletsprojects.com/en/stable/testing/), [Flask uploads](https://flask.palletsprojects.com/en/stable/patterns/fileuploads/), [PyMongo connections](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/connect/).
