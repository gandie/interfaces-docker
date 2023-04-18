import json

request = container.REQUEST
response = request.response

res = {}
res['choreos'] = context.get_choreo_q(
    choreo_name=choreo_name,
    choreo_author=choreo_author,
    choreotype_name=choreotype_name,
    include_rawdata=include_rawdata,
    choreo_id=choreo_id
).dictionaries()

if mode == 'json':
    response.setHeader('Content-Type', 'application/json')
    return json.dumps(res)
else:
    return res
