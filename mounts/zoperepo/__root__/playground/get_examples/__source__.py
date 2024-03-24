import json

request = container.REQUEST
response = request.response

examples = context.examples.objectIds()
result = []

for example_name in examples:
    example = getattr(context.examples, example_name)
    example_d = {
        "example_id": example.id,
        "example_title": example.title or 'dummy!',
    }
    result.append(example_d)

response.setHeader('Content-Type', 'application/json')
return json.dumps({"examples": result})
