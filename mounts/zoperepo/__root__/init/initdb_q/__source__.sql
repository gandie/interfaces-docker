drop table if exists choreotype cascade;
drop table if exists rawdata cascade;
drop table if exists choreo cascade;

create table choreotype (
    choreotype_id bigserial primary key,
    choreotype_name text
);

create table rawdata (
    rawdata_id bigserial primary key,
    rawdata_json jsonb
);

create table choreo (
    choreo_id bigserial primary key,
    choreo_name text,
    choreo_author text,
    choreo_modtime timestamp,
    choreo_rawdata_id bigint,
    choreo_choreotype_id bigint,
    foreign key(choreo_rawdata_id) references rawdata(rawdata_id) ON DELETE CASCADE,
    foreign key(choreo_choreotype_id) references choreotype(choreotype_id)
);

insert into choreotype (choreotype_name) values ('tensorflowjs-movenet');
insert into choreotype (choreotype_name) values ('tensorflowjs-blazepose');
insert into choreotype (choreotype_name) values ('generic-json');
insert into choreotype (choreotype_name) values ('python-mediapipe-perframe-blazepose');