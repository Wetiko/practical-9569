/* Python runs in a disposable worker so a stuck program can be stopped. */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.28.2/full/pyodide.js');
const ready = loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.28.2/full/'});
self.onmessage = async ({data}) => {
 try {
  const py = await ready;
  self.postMessage({type:'status',message:'Preparing test cases…'});
  if (data.problem.kind === 'sql' || /sqlite3/.test(data.problem.setup+'\n'+data.code)) await py.loadPackage('sqlite3');
  py.globals.set('_payload_json', JSON.stringify(data));
  self.postMessage({type:'executing'});
  const result = await py.runPythonAsync(`
import json, traceback, io, contextlib, tempfile, os, builtins, ast
_payload = json.loads(_payload_json)
_problem = _payload['problem']
_results = []
class _LimitedOutput(io.StringIO):
    def write(self, text):
        if self.tell() + len(text) > 12000:
            raise RuntimeError('Output limit reached (12000 characters). Reduce printed output.')
        return super().write(text)
for _case in _payload['tests']:
    _capture = _LimitedOutput()
    _stderr = _LimitedOutput()
    _raw = ''
    _old_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as _folder, contextlib.chdir(_folder):
            for _name, _content in _problem.get('files', {}).items():
                with open(_name, 'w') as _file:
                    _file.write(_content)
            _input_lines = iter(_payload.get('stdin', '').splitlines())
            def _input(prompt=''):
                print(prompt, end='')
                try: return next(_input_lines)
                except StopIteration: raise EOFError('No more input; add lines in Standard input.')
            _builtins = dict(vars(builtins))
            _builtins['input'] = _input
            _ns = {'__builtins__': _builtins, '__name__':'__practice__', 'code': _payload['code']}
            with contextlib.redirect_stdout(_capture), contextlib.redirect_stderr(_stderr):
                if _problem['kind'] != 'sql':
                    exec(compile(_payload['code'], 'solution.py', 'exec'), _ns)
                exec(_problem.get('setup', ''), _ns)
                _actual = eval(_case['expr'], _ns)
                _raw = repr(_actual)[:12000]
                _actual = json.loads(json.dumps(_actual))
            _results.append({'label':_case['label'], 'passed':_actual == _case['expected'], 'actual':_actual, 'expected':_case['expected'], 'expression':_case['expr'], 'raw':_raw, 'stdout':_capture.getvalue()[:12000], 'stderr':_stderr.getvalue()[:12000]})
    except BaseException as _error:
        _results.append({'label':_case['label'], 'passed':False, 'error':''.join(traceback.format_exception(type(_error),_error,_error.__traceback__))[-6000:], 'expected':_case['expected'], 'expression':_case['expr'], 'raw':_raw, 'stdout':_capture.getvalue()[:12000], 'stderr':_stderr.getvalue()[:12000]})
    finally:
        os.chdir(_old_dir)
json.dumps(_results)
`);
  self.postMessage({type:'result',results:JSON.parse(result)});
 } catch(error) { self.postMessage({type:'error',message:String(error)}); }
};
