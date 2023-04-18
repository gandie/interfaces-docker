insert into rawdata (rawdata_json) values (
    <dtml-sqlvar rawdata type="string">
) returning rawdata_id