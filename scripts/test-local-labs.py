"""Verify reference solutions and unfinished starters in freshly extracted packs."""
import os, pathlib, subprocess, tempfile, zipfile
root = pathlib.Path(__file__).resolve().parents[1]
for name in ['bookings-portal','photo-catalogue','quiz-server','game-client','lost-property']:
    with tempfile.TemporaryDirectory() as folder:
        with zipfile.ZipFile(root / 'public/labs' / (name+'.zip')) as pack:
            pack.extractall(folder)
        test = next(pathlib.Path(folder).rglob('test_lab.py'))
        for module in ['solution','starter']:
            result = subprocess.run([os.sys.executable,'-m','unittest','-v','test_lab'],cwd=test.parent,
                env={**os.environ,'LAB_MODULE':module},capture_output=True,text=True,timeout=30)
            if (result.returncode == 0) != (module == 'solution'):
                raise AssertionError(f'{name} {module}\n{result.stdout}\n{result.stderr}')
        print(name+': reference passed; unfinished starter rejected',flush=True)
