select
  choreo_id,
  choreo_name,
  choreo_author,
  to_char(choreo_modtime, 'DD.MM.YYYY HH24:MI') as choreo_modtime,
  <dtml-if include_rawdata>
  rawdata_json,
  </dtml-if>
  choreotype_name
from
  choreo

join rawdata
  on rawdata_id = choreo_rawdata_id

join choreotype
  on choreotype_id = choreo_choreotype_id

<dtml-sqlgroup where>
    <dtml-if choreo_name>
        choreo_name = <dtml-sqlvar choreo_name type="string">
    </dtml-if>
    <dtml-and>
    <dtml-if choreo_author>
        choreo_author = <dtml-sqlvar choreo_author type="string">
    </dtml-if>
    <dtml-and>
    <dtml-if choreotype_name>
        choreotype_name = <dtml-sqlvar choreotype_name type="string">
    </dtml-if>
    <dtml-and>
    <dtml-if choreo_id>
        choreo_id = <dtml-sqlvar choreo_id type="int">
    </dtml-if></dtml-sqlgroup where>