CREATE DATABASE proj3db;

\c proj3db;

CREATE TABLE email_schedule (
id serial PRIMARY KEY,
sender_email varchar(255),
email_body text,
email_subject text,
email_sequence int,
email_interval varchar(50)
);

CREATE TABLE users (
id serial PRIMARY KEY,
email varchar(255),
created timestamp DEFAULT localtimestamp,
last_email_sent timestamp
);
