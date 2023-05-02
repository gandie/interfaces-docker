import json
from jsonpath_ng.ext import parse

res = context.fetch(
    mode='python',
    choreo_id=choreo_id,
    include_rawdata=True,
)['choreos'][0]

choreo_json = res['rawdata_json']

jsonpath_expr = parse(jsonpath_expr)
# jsonpath_expr = parse('$[*][?(index = 27)]')

matches = [match.value for match in jsonpath_expr.find(choreo_json)]

result = {
    'choreo_json': matches,
    'name': res['choreo_name'],
    'author': res['choreo_author'],
}

context.REQUEST.response.setHeader('Content-Type', 'application/json')
return json.dumps(result)
