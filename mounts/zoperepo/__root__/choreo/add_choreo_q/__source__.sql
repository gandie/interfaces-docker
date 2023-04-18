insert into choreo (
    choreo_name,
    choreo_author,
    choreo_modtime,
    choreo_rawdata_id,
    choreo_choreotype_id
) values (
    <dtml-sqlvar name type="string">,
    <dtml-sqlvar author type="string">,
    now(),
    <dtml-sqlvar rawdata_id type="int">,
    <dtml-sqlvar type_id type="int">
) returning choreo_id