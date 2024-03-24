import json

request = container.REQUEST
response = request.response

'''
context.delete_q(choreo_id=choreo_id)

res = {
    'msg': 'Choreo-ID %s deleted!' % choreo_id
}
'''
res = {
    'msg': 'Locked'
}


response.setHeader('Content-Type', 'application/json')

return json.dumps(res)
