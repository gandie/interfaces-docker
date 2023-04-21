if not name:
    name = 'Unknown_Choreo'

rawdata_id = context.add_rawdata_q(
    rawdata=rawdata,
)[0][0]

choreo_id = context.add_choreo_q(
    name=name,
    type_id=type_id,
    author=author,
    rawdata_id=rawdata_id,
)[0][0]

return choreo_id
