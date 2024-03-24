select setval('rawdata_rawdata_id_seq', (select max(rawdata_id) from rawdata));
select setval('choreo_choreo_id_seq', (select max(choreo_id) from choreo));