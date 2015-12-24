CREATE DATABASE mygamedb;
\c mygamedb;

CREATE EXTENSION pgcrypto;
CREATE OR REPLACE FUNCTION SHA1(bytea) returns text AS $$
  SELECT encode(digest($1, 'sha1'), 'hex')
$$ LANGUAGE SQL STRICT IMMUTABLE;

CREATE TABLE userdata (
  username VARCHAR(12) PRIMARY KEY,
  password_hash VARCHAR(40),
  registered TIMESTAMP DEFAULT NOW()
);

INSERT INTO userdata (username, password_hash) VALUES ('jaakko', SHA1('myexcellentpassword'));
INSERT INTO userdata (username, password_hash) VALUES ('anssi', SHA1('anotherexcellentpwd'));