# Photo catalogue upload

Syllabus: 4.2.3–4.2.4 / 2.4.2. Estimated 45 minutes. Original synthetic practice project.

Implement create_app(database, upload_dir). GET / lists saved image titles and images. POST / accepts title and photo; require a nonempty title and a valid PNG/JPEG image no larger than the 2 MiB request limit. Use a generated filename, save the image and its SQLite row, and redirect. Validate image content, not just its extension. Delete the saved file if the database write fails. GET /photos/<name> serves existing uploads and returns 404 for missing files. Use the supplied tests and inspect the rendered gallery.

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
- [ ] Reject missing/corrupt uploads before writing files or rows.
- [ ] Generate distinct safe filenames even for identical original names; serve images through a safe directory route.
- [ ] Verify cleanup on database failure, persistent rows and descriptive image alt text.

These local learning apps do not include production authentication. Use fictional data and loopback addresses. The tests exercise behaviour; manually review your code structure and rendered pages too.

References: [Flask testing](https://flask.palletsprojects.com/en/stable/testing/), [Flask uploads](https://flask.palletsprojects.com/en/stable/patterns/fileuploads/), [PyMongo connections](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/connect/).
