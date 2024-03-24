request = container.REQUEST
response = request.response

examples = context.examples.objectIds()

js = ["EXAMPLES = {}"]

for example_name in examples:
    example = getattr(context.examples, example_name)
    res = str(example)
    text = "var {name} = `".format(name=example.id) + res + "`"
    js.append(text)
    more = "EXAMPLES.{name} = {name}".format(name=example.id)
    js.append(more)

response.setHeader('Content-Type', 'application/javascript')
return "\n".join(js)
